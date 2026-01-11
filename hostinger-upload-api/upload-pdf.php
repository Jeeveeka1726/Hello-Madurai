<?php
/**
 * Hostinger PDF Upload API
 * Direct upload to Hostinger server, bypassing Vercel limits
 * Supports up to 512MB PDFs for ePaper/Magazine section
 */

// Enable CORS for all domains (temporary for testing)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Configuration
$UPLOAD_DIR = __DIR__ . '/uploads/magazines/';
$PUBLIC_URL_BASE = 'https://hellomadurai.com/api/uploads/magazines/';
$MAX_FILE_SIZE = 512 * 1024 * 1024; // 512 MB
$ALLOWED_TYPES = ['application/pdf'];

// Create upload directory if it doesn't exist
if (!is_dir($UPLOAD_DIR)) {
    if (!mkdir($UPLOAD_DIR, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit();
    }
}

// Check if file was uploaded
if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
    $error_message = 'No file uploaded';
    if (isset($_FILES['pdf']['error'])) {
        switch ($_FILES['pdf']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $error_message = 'File too large (server limit exceeded)';
                break;
            case UPLOAD_ERR_PARTIAL:
                $error_message = 'File upload was interrupted';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $error_message = 'Server configuration error (no temp directory)';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $error_message = 'Server configuration error (cannot write file)';
                break;
        }
    }
    
    http_response_code(400);
    echo json_encode(['error' => $error_message]);
    exit();
}

$file = $_FILES['pdf'];

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime_type, $ALLOWED_TYPES)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only PDF files are allowed.']);
    exit();
}

// Validate file size
if ($file['size'] > $MAX_FILE_SIZE) {
    http_response_code(413);
    echo json_encode(['error' => 'File too large. Maximum size is 512MB.']);
    exit();
}

// Generate unique filename
$timestamp = time();
$original_name = pathinfo($file['name'], PATHINFO_FILENAME);
$sanitized_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $original_name);
$filename = $timestamp . '_' . $sanitized_name . '.pdf';
$filepath = $UPLOAD_DIR . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit();
}

// Generate public URL
$public_url = $PUBLIC_URL_BASE . $filename;

// Log successful upload
error_log("PDF uploaded successfully: $filename (" . round($file['size'] / 1024 / 1024, 2) . " MB)");

// Return success response
echo json_encode([
    'success' => true,
    'url' => $public_url,
    'filename' => $filename,
    'size' => $file['size'],
    'type' => $mime_type,
    'uploadedAt' => date('Y-m-d H:i:s')
]);
?>
