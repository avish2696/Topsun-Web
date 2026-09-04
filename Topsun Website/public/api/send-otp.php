<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$defaultKey = 'LVuDBUhc-E0DcQcCP1kCK6632ZPfkF-yZptzS8Uks9Y';

// Accept both POST form and JSON payload
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true);

$mobile = $_POST['mobile'] ?? $jsonInput['mobile'] ?? $_GET['mobile'] ?? '';
$otp = $_POST['otp'] ?? $jsonInput['otp'] ?? $_GET['otp'] ?? '';
$authkey = $_POST['authkey'] ?? $jsonInput['authkey'] ?? $_GET['authkey'] ?? $defaultKey;

if (empty($mobile) || empty($otp)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameter: mobile or otp']);
    exit;
}

// Clean mobile to 10 digits and prefix 91
$digitsOnly = preg_replace('/\D/', '', $mobile);
$raw10 = strlen($digitsOnly) > 10 ? substr($digitsOnly, -10) : $digitsOnly;
$formattedMobile = '91' . $raw10;

$postFields = http_build_query([
    'authkey' => $authkey,
    'mobile' => $formattedMobile,
    'otp' => $otp
]);

// 1. Try cURL
$ch = curl_init('https://apitxt.com/api/sendOTP');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'User-Agent: TOPSUN-ECommerce/1.0'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$result = curl_exec($ch);
$curlErr = curl_error($ch);
curl_close($ch);

// 2. Fallback to file_get_contents if cURL failed
if (!$result || !empty($curlErr)) {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\nUser-Agent: TOPSUN-ECommerce/1.0\r\n",
            'content' => $postFields,
            'timeout' => 15
        ]
    ]);
    $result = @file_get_contents('https://apitxt.com/api/sendOTP', false, $ctx);
}

if ($result) {
    echo $result;
} else {
    http_response_code(502);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unable to connect to SMS gateway from host server'
    ]);
}
