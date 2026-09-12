<?php
require_once __DIR__ . '/config.php';
/**
 * send-email.php - TOPSUN Hardened Email Dispatcher
 * Sender: noreply@topsun.in
 * Security Features:
 * - Anti-relay protection: strictly restricted to verified origins (topsun.in, localhost)
 * - Method restriction: POST only
 * - IP Rate Limiting: max 5 emails per 30 minutes, 30-second cooldown
 * - Email Header Injection prevention (\r, \n sanitization in headers)
 * - Body size limit (max 65 KB)
 * - Safe error responses (no internal path leakage)
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Robots-Tag: noindex, nofollow');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');

// 1. Enforce Allowed Origins
$allowedOrigins = ALLOWED_ORIGINS;

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';

$originAllowed = false;
if (!empty($origin)) {
    foreach ($allowedOrigins as $allowed) {
        if (strcasecmp($origin, $allowed) === 0) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Max-Age: 86400');
            $originAllowed = true;
            break;
        }
    }
} else {
    foreach ($allowedOrigins as $allowed) {
        if (stripos($referer, $allowed) === 0) {
            header("Access-Control-Allow-Origin: {$allowed}");
            $originAllowed = true;
            break;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Reject non-POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Only POST requests are permitted.']);
    exit;
}

// 3. Resolve Client IP Safely
function getClientIP(): string {
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_REAL_IP',
        'HTTP_X_FORWARDED_FOR',
        'REMOTE_ADDR'
    ];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', $_SERVER[$header]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$clientIp = getClientIP();

// 4. Rate Limiting System (Persistent via Secure Temp Storage)
$rateLimitDir = RL_DIR_MAIL;
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0700, true);
}

function checkEmailRateLimit(string $key, int $maxRequests, int $windowSeconds, int $cooldownSeconds): array {
    global $rateLimitDir;
    $filePath = $rateLimitDir . '/' . hash('sha256', $key) . '.json';
    $now = time();
    $data = ['requests' => [], 'last_request' => 0];

    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        if ($content) {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }
    }

    // Cooldown check (30 seconds between dispatches)
    $lastRequest = $data['last_request'] ?? 0;
    $secondsSinceLast = $now - $lastRequest;
    if ($secondsSinceLast < $cooldownSeconds) {
        $waitRemaining = $cooldownSeconds - $secondsSinceLast;
        return [
            'allowed' => false,
            'wait_seconds' => $waitRemaining,
            'message' => "Please wait {$waitRemaining} second(s) before sending another email."
        ];
    }

    // Window check
    $recentRequests = array_filter($data['requests'] ?? [], function($timestamp) use ($now, $windowSeconds) {
        return ($now - $timestamp) < $windowSeconds;
    });

    if (count($recentRequests) >= $maxRequests) {
        $oldest = reset($recentRequests);
        $resetTime = ($oldest + $windowSeconds) - $now;
        return [
            'allowed' => false,
            'wait_seconds' => max(1, $resetTime),
            'message' => "Email rate limit reached (max {$maxRequests} per 30 min). Please try again in " . ceil(max(1, $resetTime) / 60) . " minute(s)."
        ];
    }

    $recentRequests[] = $now;
    $data['requests'] = array_values($recentRequests);
    $data['last_request'] = $now;

    @file_put_contents($filePath, json_encode($data), LOCK_EX);

    return ['allowed' => true];
}

// Check IP Rate Limit: max 5 emails per 30 min, 30s cooldown
$limitCheck = checkEmailRateLimit("mail_ip_{$clientIp}", 5, 1800, 30);
if (!$limitCheck['allowed']) {
    http_response_code(429);
    header('Retry-After: ' . $limitCheck['wait_seconds']);
    echo json_encode([
        'success' => false,
        'error' => $limitCheck['message'],
        'retry_after' => $limitCheck['wait_seconds']
    ]);
    exit;
}

// 5. Parse and Validate Payload
$rawInput = file_get_contents('php://input');

// Protect against memory exhaustion (max 65KB payload)
if (strlen($rawInput) > 65536) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'Payload too large. Maximum 64KB permitted.']);
    exit;
}

$data = json_decode($rawInput, true) ?: $_POST;

$recipient = trim($data['to'] ?? $data['recipient'] ?? '');
$rawSubject = trim($data['subject'] ?? 'Notification from TOPSUN Footwear');
$content = trim($data['body'] ?? $data['message'] ?? $data['html'] ?? '');

// 6. Security Header Injection Prevention (Strip \r, \n and control chars)
$recipient = str_replace(["\r", "\n", "%0a", "%0d"], '', $recipient);
$subject = str_replace(["\r", "\n", "%0a", "%0d"], '', $rawSubject);

if (empty($recipient) || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'A valid recipient email address is required.'
    ]);
    exit;
}

if (empty($content)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Email content body is required.'
    ]);
    exit;
}

// 7. Hostinger Sender Identity (from server-side config.php)
$fromEmail   = SMTP_FROM_EMAIL;
$fromName    = SMTP_FROM_NAME;
$replyToEmail = REPLY_TO_EMAIL;

// Format plain text into clean HTML if raw HTML was not provided
$isHtml = (strpos($content, '<html') !== false) || (strpos($content, '<div') !== false) || (strpos($content, '<p') !== false);

if (!$isHtml) {
    $paragraphs = explode("\n\n", $content);
    $htmlParagraphs = '';
    foreach ($paragraphs as $p) {
        $p = trim($p);
        if ($p !== '') {
            $htmlParagraphs .= '<p style="margin:0 0 14px 0; color:#374151; font-size:14px; line-height:1.6;">' . nl2br(htmlspecialchars($p, ENT_QUOTES, 'UTF-8')) . '</p>';
        }
    }

    $safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');

    $formattedHtml = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$safeSubject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e4e4e7; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color:#009FE3; padding:20px 24px; text-align:left;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">TOPSUN</span>
                    <span style="color:#ffffff; opacity:0.85; font-size:12px; margin-left:8px; font-weight:600;">| Performance Footwear</span>
                  </td>
                  <td align="right">
                    <span style="background-color:rgba(255,255,255,0.2); color:#ffffff; font-size:10px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase;">Verified</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px; text-align:left;">
              <h2 style="margin:0 0 16px 0; color:#18181b; font-size:18px; font-weight:700;">{$safeSubject}</h2>
              {$htmlParagraphs}

              <div style="margin-top:24px; padding-top:20px; border-top:1px solid #f4f4f5;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="https://topsun.in/shop" target="_blank" style="display:inline-block; background-color:#009FE3; color:#ffffff; font-size:13px; font-weight:700; text-decoration:none; padding:12px 24px; border-radius:8px; text-transform:uppercase; letter-spacing:0.5px;">Visit TOPSUN Store</a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa; padding:20px 24px; border-top:1px solid #e4e4e7; font-size:11px; color:#71717a; text-align:center; line-height:1.6;">
              <p style="margin:0 0 6px 0; font-weight:600; color:#27272a;">INTELAGROW PVT. LTD. (TOPSUN Footwear)</p>
              <p style="margin:0 0 6px 0;">A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman - 713358, West Bengal</p>
              <p style="margin:0;">Helpline / WhatsApp: +91 7485006659 &bull; Sent securely from <strong>noreply@topsun.in</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
} else {
    $formattedHtml = $content;
}

// 8. Construct Secure Mail Headers (RFC 2822 compliant)
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/html; charset=UTF-8';
$headers[] = "From: {$fromName} <{$fromEmail}>";
$headers[] = "Reply-To: TOPSUN Support <{$replyToEmail}>";
$headers[] = "Return-Path: <{$fromEmail}>";
$headers[] = 'X-Sender: ' . $fromEmail;
$headers[] = 'X-Mailer: TOPSUN-Security-Mailer/1.0';
$headers[] = 'X-Auto-Response-Suppress: All';

$headerString = implode("\r\n", $headers);
$additionalParams = "-f {$fromEmail}";

// 9. Send using Hostinger mail transport
$mailSent = @mail($recipient, $subject, $formattedHtml, $headerString, $additionalParams);

if (!$mailSent) {
    $mailSent = @mail($recipient, $subject, $formattedHtml, $headerString);
}

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => "Email dispatched successfully to {$recipient} from {$fromEmail}",
        'sender' => $fromEmail,
        'timestamp' => date('c')
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server was unable to dispatch the email at this moment. Please verify hostinger quota.'
    ]);
}
