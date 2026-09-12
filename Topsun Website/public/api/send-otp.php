<?php
/**
 * send-otp.php - TOPSUN Hardened SMS OTP Gateway Dispatcher
 *
 * Security Features:
 *  - API key lives in server-side config.php (NEVER in the frontend bundle)
 *  - Strict POST-only enforcement (GET/HEAD rejected with 405)
 *  - Origin & Referer whitelist (anti-CSRF / anti-relay)
 *  - Payload size cap (max 4 KB)
 *  - Multi-tier rate limiting: IP (5/15 min) + Phone (3/15 min), 60-second cooldown
 *  - Strict 10-digit Indian mobile regex
 *  - 4–6 digit numeric OTP format enforcement
 *  - No internal path / key leakage in error responses
 *  - Security headers on every response
 */

require_once __DIR__ . '/config.php';

// ── Response headers ──────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Robots-Tag: noindex, nofollow');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');

// ── 1. Origin whitelisting (CORS + anti-CSRF) ─────────────────────────────────
$origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$originAllowed = false;

if (!empty($origin)) {
    foreach (ALLOWED_ORIGINS as $allowed) {
        if (strcasecmp($origin, $allowed) === 0) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
            header('Access-Control-Max-Age: 86400');
            header('Vary: Origin');
            $originAllowed = true;
            break;
        }
    }
} else {
    foreach (ALLOWED_ORIGINS as $allowed) {
        if (stripos($referer, $allowed) === 0) {
            header("Access-Control-Allow-Origin: {$allowed}");
            $originAllowed = true;
            break;
        }
    }
}

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Block unknown origins (allow empty-origin for same-origin server requests)
if (!$originAllowed && !empty($origin)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden: origin not allowed.']);
    exit;
}

// ── 2. Method guard ───────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST, OPTIONS');
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed. Only POST is permitted.']);
    exit;
}

// ── 3. Payload size cap (4 KB max) ───────────────────────────────────────────
$rawInput = file_get_contents('php://input');
if (strlen($rawInput) > 4096) {
    http_response_code(413);
    echo json_encode(['status' => 'error', 'message' => 'Payload too large.']);
    exit;
}

// ── 4. Resolve real client IP (Cloudflare → X-Real-IP → X-Forwarded-For → REMOTE_ADDR)
function getClientIP(): string {
    $chain = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($chain as $h) {
        if (!empty($_SERVER[$h])) {
            $ip = trim(explode(',', $_SERVER[$h])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    // Fallback (includes private IPs for localhost dev)
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$clientIp = getClientIP();

// ── 5. Rate-limiting helper ───────────────────────────────────────────────────
if (!is_dir(RL_DIR_OTP)) {
    @mkdir(RL_DIR_OTP, 0700, true);
}

function checkRateLimit(string $key, int $maxRequests, int $windowSec, int $cooldownSec): array {
    $filePath = RL_DIR_OTP . '/' . hash('sha256', $key) . '.json';
    $now  = time();
    $data = ['requests' => [], 'last_request' => 0];

    if (is_file($filePath)) {
        $raw = @file_get_contents($filePath);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }
    }

    // Cooldown check
    $elapsed = $now - ($data['last_request'] ?? 0);
    if ($elapsed < $cooldownSec) {
        $wait = $cooldownSec - $elapsed;
        return [
            'allowed'      => false,
            'reason'       => 'cooldown',
            'wait_seconds' => $wait,
            'message'      => "Please wait {$wait} second(s) before requesting another OTP.",
        ];
    }

    // Window check
    $recent = array_values(array_filter(
        $data['requests'] ?? [],
        fn($t) => ($now - $t) < $windowSec
    ));

    if (count($recent) >= $maxRequests) {
        $resetIn = ($recent[0] + $windowSec) - $now;
        $mins    = (int) ceil(max(1, $resetIn) / 60);
        return [
            'allowed'      => false,
            'reason'       => 'rate_limit',
            'wait_seconds' => max(1, $resetIn),
            'message'      => "Too many OTP requests. Please try again in {$mins} minute(s).",
        ];
    }

    // Record attempt
    $recent[] = $now;
    $data['requests']    = $recent;
    $data['last_request'] = $now;
    @file_put_contents($filePath, json_encode($data), LOCK_EX);

    return ['allowed' => true];
}

// ── 6. IP rate limit: 5 requests / 15 min, 60-second cooldown ────────────────
$ipCheck = checkRateLimit("ip_{$clientIp}", 5, 900, 60);
if (!$ipCheck['allowed']) {
    http_response_code(429);
    header('Retry-After: ' . $ipCheck['wait_seconds']);
    echo json_encode([
        'status'      => 'error',
        'code'        => 'IP_RATE_LIMIT',
        'message'     => $ipCheck['message'],
        'retry_after' => $ipCheck['wait_seconds'],
    ]);
    exit;
}

// ── 7. Parse & sanitise payload ───────────────────────────────────────────────
$json   = json_decode($rawInput, true) ?: [];
$mobile = trim($json['mobile'] ?? $_POST['mobile'] ?? '');
$otp    = trim($json['otp']    ?? $_POST['otp']    ?? '');

// Strip non-digits from mobile, take last 10
$digitsOnly = preg_replace('/\D/', '', $mobile);
$raw10      = strlen($digitsOnly) > 10 ? substr($digitsOnly, -10) : $digitsOnly;

if (empty($raw10) || empty($otp)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Mobile number and OTP are required.']);
    exit;
}

// Validate: standard 10-digit Indian mobile (starts with 6–9)
if (!preg_match('/^[6-9]\d{9}$/', $raw10)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Invalid Indian mobile number (must be 10 digits starting with 6–9).']);
    exit;
}

// Validate OTP format
if (!preg_match('/^\d{4,6}$/', $otp)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Invalid OTP format (4–6 numeric digits required).']);
    exit;
}

// ── 8. Phone-number rate limit: 3 requests / 15 min, 60-second cooldown ──────
$phoneCheck = checkRateLimit("phone_{$raw10}", 3, 900, 60);
if (!$phoneCheck['allowed']) {
    http_response_code(429);
    header('Retry-After: ' . $phoneCheck['wait_seconds']);
    echo json_encode([
        'status'      => 'error',
        'code'        => 'PHONE_RATE_LIMIT',
        'message'     => $phoneCheck['message'],
        'retry_after' => $phoneCheck['wait_seconds'],
    ]);
    exit;
}

// ── 9. Dispatch OTP via APITxT (key from server-side config.php only) ─────────
$formattedMobile = '91' . $raw10;
$postFields      = http_build_query([
    'authkey' => APITXT_AUTH_KEY,
    'mobile'  => $formattedMobile,
    'otp'     => $otp,
]);

// Primary: cURL
$result  = null;
$curlErr = '';
if (function_exists('curl_init')) {
    $ch = curl_init('https://apitxt.com/api/sendOTP');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: TOPSUN-Mailer/2.0',
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_CONNECTTIMEOUT => 6,
    ]);
    $result  = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
}

// Fallback: stream
if (!$result || !empty($curlErr) || ($httpCode ?? 0) >= 500) {
    $ctx    = stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/x-www-form-urlencoded\r\nUser-Agent: TOPSUN-Mailer/2.0\r\n",
        'content' => $postFields,
        'timeout' => 12,
    ]]);
    $result = @file_get_contents('https://apitxt.com/api/sendOTP', false, $ctx);
}

// ── 10. Respond ───────────────────────────────────────────────────────────────
if ($result) {
    $decoded = json_decode($result, true);
    echo json_encode([
        'status'   => ($decoded['status'] ?? 'success'),
        'message'  => ($decoded['message'] ?? 'OTP dispatched successfully via SMS.'),
        'cooldown' => 60,
    ]);
} else {
    http_response_code(502);
    echo json_encode([
        'status'  => 'error',
        'message' => 'SMS gateway is temporarily unavailable. Please use the Supabase SMS fallback.',
    ]);
}
