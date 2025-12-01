# Hello Madurai - Upload API

This is a simple Express.js API for handling large file uploads (100MB+) for the Hello Madurai application.

## Why This Exists

Vercel has a 4.5MB body size limit for serverless functions, which prevents uploading large audio files. This API runs on Hostinger and handles large file uploads without any size restrictions.

## Setup Instructions

### 1. Install Dependencies

```bash
cd hostinger-upload-api
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="mysql://your_username:your_password@srv1990.hstgr.io:3306/your_database"
PORT=3001
ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:3000"
```

### 3. Set Up Prisma

Copy the Prisma schema from your Next.js app:

```bash
mkdir -p prisma
cp ../hello-madurai-app/prisma/schema.prisma prisma/
```

Generate Prisma client:

```bash
npx prisma generate
```

### 4. Run Locally (for testing)

```bash
npm run dev
```

The API will run on `http://localhost:3001`

### 5. Deploy to Hostinger

#### Option A: Using PM2 (Recommended)

1. Upload files to Hostinger via FTP/SSH
2. SSH into your Hostinger server
3. Install dependencies:
   ```bash
   cd /path/to/hostinger-upload-api
   npm install --production
   ```
4. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
5. Start the API with PM2:
   ```bash
   pm2 start server.js --name hello-madurai-upload-api
   pm2 save
   pm2 startup
   ```

#### Option B: Using Node.js directly

```bash
cd /path/to/hostinger-upload-api
npm install --production
node server.js
```

### 6. Configure Nginx/Apache (if needed)

If you want to access the API via a subdomain (e.g., `api.hellomadurai.com`), configure a reverse proxy:

**Nginx example:**
```nginx
server {
    listen 80;
    server_name api.hellomadurai.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Important for large file uploads
        client_max_body_size 100M;
    }
}
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "Upload API is running"
}
```

### Upload Audio
```
POST /upload/audio
Content-Type: multipart/form-data
```

Body:
- `file`: Audio file (max 100MB)

Response:
```json
{
  "id": "clxxx...",
  "filename": "song.mp3",
  "size": 5242880,
  "duration": "3:45",
  "mimeType": "audio/mpeg",
  "url": "/api/audio/clxxx..."
}
```

## Testing

Test the API with curl:

```bash
curl -X POST http://localhost:3001/upload/audio \
  -F "file=@/path/to/audio.mp3"
```

## Troubleshooting

### Port already in use
Change the `PORT` in `.env` file

### CORS errors
Add your domain to `ALLOWED_ORIGINS` in `.env`

### Database connection errors
Check your `DATABASE_URL` in `.env`

### File size limit errors
The limit is set to 100MB. To change it, edit `server.js` line 32.

## Security Notes

- Only audio files are accepted
- CORS is configured to only allow requests from your domains
- File size is limited to 100MB
- All files are stored in the database (not on filesystem)

## Monitoring

Check if the API is running:
```bash
pm2 status
pm2 logs hello-madurai-upload-api
```

Restart the API:
```bash
pm2 restart hello-madurai-upload-api
```

Stop the API:
```bash
pm2 stop hello-madurai-upload-api
```

