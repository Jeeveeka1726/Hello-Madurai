<?php
// Simple PDF Upload Script for Hostinger
// Place this in /public_html/upload-pdf.php

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if file uploaded
if (!isset($_FILES['pdf'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['pdf'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload failed: ' . $file['error']]);
    exit;
}

// Validate file type
if ($file['type'] !== 'application/pdf') {
    http_response_code(400);
    echo json_encode(['error' => 'Only PDF files allowed']);
    exit;
}

// Create upload directory
$uploadDir = __DIR__ . '/uploads/magazines/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate filename
$filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
$filepath = $uploadDir . $filename;

// Move file
if (move_uploaded_file($file['tmp_name'], $filepath)) {
    $url = 'https://hellomadurai.com/uploads/magazines/' . $filename;
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename,
        'size' => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
?>
