# 🚀 Hostinger PDF Upload API Installation

## 📁 **Step 1: Upload Files to Hostinger**

### **Via cPanel File Manager:**
1. Login to your Hostinger cPanel
2. Open **File Manager**
3. Navigate to `/public_html/`
4. Create folder: `api`
5. Upload these files to `/public_html/api/`:
   - `upload-pdf.php`
   - `.htaccess`

### **Final Directory Structure:**
```
/public_html/
├── api/
│   ├── upload-pdf.php
│   ├── .htaccess
│   └── uploads/
│       └── magazines/ (will be created automatically)
```

## ⚙️ **Step 2: Configure PHP Settings**

### **Option A: Via cPanel (Recommended)**
1. Go to **Select PHP Version** in cPanel
2. Click **Switch to PHP Options**
3. Set these values:
   - `upload_max_filesize`: 512M
   - `post_max_size`: 512M
   - `memory_limit`: 512M
   - `max_execution_time`: 300
   - `max_input_time`: 300

### **Option B: Via .htaccess (Already included)**
The `.htaccess` file already contains these settings.

## 🔧 **Step 3: Test the API**

### **Test URL:**
```
https://yourdomain.com/api/upload-pdf.php
```

### **Test with cURL:**
```bash
curl -X POST \
  -F "pdf=@test.pdf" \
  https://yourdomain.com/api/upload-pdf.php
```

### **Expected Response:**
```json
{
  "success": true,
  "url": "https://yourdomain.com/api/uploads/magazines/1234567890_test.pdf",
  "filename": "1234567890_test.pdf",
  "size": 1048576,
  "type": "application/pdf",
  "uploadedAt": "2024-01-10 12:00:00"
}
```

## 🛡️ **Step 4: Security Setup**

### **File Permissions:**
```bash
chmod 755 /public_html/api/
chmod 644 /public_html/api/upload-pdf.php
chmod 644 /public_html/api/.htaccess
chmod 755 /public_html/api/uploads/
chmod 755 /public_html/api/uploads/magazines/
```

### **Domain Whitelist:**
Update the CORS headers in `upload-pdf.php` with your actual domain:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

## 📊 **Step 5: Monitor Usage**

### **Check Error Logs:**
- Location: `/public_html/api/error.log`
- View via cPanel File Manager or SSH

### **Monitor Storage:**
- Check `/public_html/api/uploads/magazines/` folder size
- Hostinger Business: 200GB limit

## ✅ **Verification Checklist:**

- [ ] Files uploaded to `/public_html/api/`
- [ ] PHP limits configured (512M)
- [ ] Test upload works
- [ ] CORS headers set correctly
- [ ] File permissions set
- [ ] Error logging enabled

## 🚨 **Troubleshooting:**

### **413 Request Entity Too Large:**
- Increase `upload_max_filesize` and `post_max_size`
- Check server-level limits

### **500 Internal Server Error:**
- Check error logs
- Verify file permissions
- Ensure upload directory exists

### **CORS Errors:**
- Update `Access-Control-Allow-Origin` header
- Add your Vercel domain to whitelist

## 📞 **Support:**
If you encounter issues, check the error log at `/public_html/api/error.log`
