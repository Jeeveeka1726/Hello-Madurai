const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Dynamic import for music-metadata (ESM module)
let parseBuffer;
(async () => {
  const musicMetadata = await import('music-metadata');
  parseBuffer = musicMetadata.parseBuffer;
})();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Configure multer for memory storage (we'll store in DB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
      'audio/webm',
      'audio/flac'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upload API is running' });
});

// Upload audio endpoint
app.post('/upload/audio', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`📥 Uploading audio: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Get audio duration using music-metadata
    let duration = null;
    try {
      if (parseBuffer) {
        const metadata = await parseBuffer(req.file.buffer, { mimeType: req.file.mimetype });
        if (metadata.format.duration) {
          const totalSeconds = Math.floor(metadata.format.duration);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not extract audio duration:', error.message);
    }

    // Store in database
    const audio = await prisma.audio.create({
      data: {
        filename: req.file.originalname,
        data: req.file.buffer,
        mimeType: req.file.mimetype,
        size: req.file.size,
        duration: duration,
      },
    });

    console.log(`✅ Audio uploaded successfully: ${audio.id}`);

    // Return the audio ID and metadata
    res.json({
      id: audio.id,
      filename: audio.filename,
      size: audio.size,
      duration: audio.duration,
      mimeType: audio.mimeType,
      url: `/api/audio/${audio.id}`, // This will be served by your Next.js app
    });

  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 100MB.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to upload audio',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 100MB.' 
      });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ error: 'CORS not allowed' });
  }

  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Upload API running on port ${PORT}`);
  console.log(`📁 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`💾 Database: Connected to Hostinger MySQL`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

