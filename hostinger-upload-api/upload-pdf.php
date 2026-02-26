<?php
// Chunked PDF Upload Script for Hostinger
// Accepts 1MB chunks from browser, assembles into final PDF file
// This bypasses LiteSpeed/server body size limits entirely

@ini_set('upload_max_filesize', '10M');
@ini_set('post_max_size', '10M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', '120');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Read chunk metadata ───────────────────────────────────────────────────────
$chunkIndex  = isset($_POST['chunkIndex'])  ? intval($_POST['chunkIndex'])  : null;
$totalChunks = isset($_POST['totalChunks']) ? intval($_POST['totalChunks']) : null;
$fileId      = isset($_POST['fileId'])      ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['fileId']) : null;
$filename    = isset($_POST['filename'])    ? preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($_POST['filename'])) : null;

if ($chunkIndex === null || $totalChunks === null || !$fileId || !$filename) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing chunk metadata (chunkIndex, totalChunks, fileId, filename)']);
    exit;
}

// ── Validate chunk file ───────────────────────────────────────────────────────
if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['chunk']['error'] ?? 'missing';
    http_response_code(400);
    echo json_encode(['error' => "Chunk upload error: $errCode"]);
    exit;
}

// 2MB max per chunk (frontend sends 1MB, this gives headroom)
if ($_FILES['chunk']['size'] > 2 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['error' => 'Chunk too large (max 2MB per chunk)']);
    exit;
}

// ── Directories ───────────────────────────────────────────────────────────────
$uploadDir = __DIR__ . '/uploads/magazines/';
$tmpDir    = __DIR__ . '/uploads/tmp/' . $fileId . '/';

foreach ([$uploadDir, $tmpDir] as $dir) {
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => "Cannot create directory: $dir"]);
        exit;
    }
}

// ── Save this chunk ───────────────────────────────────────────────────────────
$chunkFile = $tmpDir . 'chunk_' . str_pad($chunkIndex, 5, '0', STR_PAD_LEFT);
if (!move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkFile)) {
    http_response_code(500);
    echo json_encode(['error' => "Failed to save chunk $chunkIndex"]);
    exit;
}

// ── Check if all chunks are received ─────────────────────────────────────────
$receivedChunks = glob($tmpDir . 'chunk_*');
if (count($receivedChunks) < $totalChunks) {
    // Not all chunks yet – acknowledge and wait
    echo json_encode([
        'success'  => false,
        'received' => count($receivedChunks),
        'total'    => $totalChunks,
        'message'  => 'Chunk received, waiting for more',
    ]);
    exit;
}

// ── All chunks received — assemble final file ─────────────────────────────────
$finalFilename = time() . '_' . $filename;
$finalPath     = $uploadDir . $finalFilename;

$out = fopen($finalPath, 'wb');
if (!$out) {
    http_response_code(500);
    echo json_encode(['error' => 'Cannot create final file']);
    exit;
}

// Write chunks in order
sort($receivedChunks);
foreach ($receivedChunks as $chunk) {
    $in = fopen($chunk, 'rb');
    if ($in) {
        while (!feof($in)) {
            fwrite($out, fread($in, 65536));
        }
        fclose($in);
        unlink($chunk); // remove chunk after writing
    }
}
fclose($out);

// Remove temp directory
@rmdir($tmpDir);

// Verify it's a valid PDF (check magic bytes)
$handle = fopen($finalPath, 'rb');
$header = fread($handle, 5);
fclose($handle);

if ($header !== '%PDF-') {
    unlink($finalPath);
    http_response_code(400);
    echo json_encode(['error' => 'Assembled file is not a valid PDF']);
    exit;
}

$url = 'https://hellomadurai.com/uploads/magazines/' . $finalFilename;
echo json_encode([
    'success'  => true,
    'url'      => $url,
    'filename' => $finalFilename,
    'size'     => filesize($finalPath),
]);
?>
