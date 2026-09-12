<?php
/**
 * config.php - TOPSUN Server-Side Configuration
 * ⚠️ NEVER expose this file to the browser.
 * All secret keys live in .env; they are NEVER sent to the frontend.
 */

// Function to safely load .env file if available
if (!function_exists('loadTopsunEnv')) {
    function loadTopsunEnv($path) {
        if (!file_exists($path)) return;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) return;
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);
                // Strip optional quotes
                if ((substr($val, 0, 1) === '"' && substr($val, -1) === '"') ||
                    (substr($val, 0, 1) === "'" && substr($val, -1) === "'")) {
                    $val = substr($val, 1, -1);
                }
                if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                    putenv("$key=$val");
                    $_ENV[$key] = $val;
                    $_SERVER[$key] = $val;
                }
            }
        }
    }
}

// Load environment variables from .env
loadTopsunEnv(dirname(__DIR__, 2) . '/.env');
loadTopsunEnv(dirname(__DIR__) . '/.env');
loadTopsunEnv(__DIR__ . '/.env');

// ── API Keys (server-side only) ──────────────────────────────────────────────
define('APITXT_AUTH_KEY',   getenv('APITXT_API_KEY') ?: ($_ENV['APITXT_API_KEY'] ?? ''));
define('SMTP_FROM_EMAIL',   getenv('VITE_SMTP_FROM_EMAIL') ?: ($_ENV['VITE_SMTP_FROM_EMAIL'] ?? 'noreply@topsun.in'));
define('SMTP_FROM_NAME',    getenv('VITE_SMTP_FROM_NAME') ?: ($_ENV['VITE_SMTP_FROM_NAME'] ?? 'TOPSUN Footwear'));
define('REPLY_TO_EMAIL',    getenv('VITE_REPLY_TO_EMAIL') ?: ($_ENV['VITE_REPLY_TO_EMAIL'] ?? 'topsunshoes7@gmail.com'));

// ── Allowed Origins (CORS whitelist) ─────────────────────────────────────────
define('ALLOWED_ORIGINS', [
    'https://topsun.in',
    'https://www.topsun.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
]);

// ── Rate Limit Directories (stored in server temp, never public) ──────────────
define('RL_DIR_OTP',  sys_get_temp_dir() . '/topsun_rl_otp');
define('RL_DIR_MAIL', sys_get_temp_dir() . '/topsun_rl_mail');
