# 🎥 Cloudinary Video Upload Setup Guide

## 📋 Overview
This guide will help you set up Cloudinary for uploading large videos (up to 100MB) to Hello Madurai.

---

## ✅ Step 1: Sign Up for Cloudinary (FREE)

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with your email
3. Verify your email address
4. Login to your Cloudinary dashboard

**FREE Tier Includes:**
- ✅ 25GB storage
- ✅ 25GB bandwidth per month
- ✅ Up to 100MB per video
- ✅ Automatic video optimization
- ✅ CDN delivery worldwide
- ✅ Auto-generated thumbnails

---

## 🔑 Step 2: Get Your Credentials

### A. Cloud Name & API Key

1. Login to Cloudinary
2. Go to **Dashboard** (https://cloudinary.com/console)
3. You'll see:
   - **Cloud Name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: (you don't need this)

### B. Create Upload Preset

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `hello_madurai_videos`
   - **Signing mode**: **Unsigned** ⚠️ (IMPORTANT!)
   - **Folder**: `hello-madurai/videos`
   - **Resource type**: `Video`
   - **Access mode**: `Public`
5. Click **Save**

---

## 📝 Step 3: Add Credentials to Project

1. Open your project folder
2. Find the file: `.env.cloudinary.example`
3. Copy it and rename to: `.env.local`
4. Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hello_madurai_videos
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=hello-madurai
NEXT_PUBLIC_CLOUDINARY_API_KEY=123456789012345
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hello_madurai_videos
```

---

## 🚀 Step 4: Tell Me Your Credentials

Once you have these 3 values, share them with me:

1. **Cloud Name**: `_____________`
2. **API Key**: `_____________`
3. **Upload Preset**: `_____________`

I will then:
1. ✅ Install Cloudinary SDK
2. ✅ Implement upload widget in admin
3. ✅ Add progress bar for uploads
4. ✅ Save Cloudinary URLs to database
5. ✅ Update video player to handle Cloudinary videos
6. ✅ Test the integration

---

## 💡 Benefits After Setup

**For Admins:**
- ✅ Upload videos up to **100MB** (vs current 4MB limit)
- ✅ See upload progress bar
- ✅ Automatic thumbnail generation
- ✅ Video optimization (smaller file sizes)
- ✅ Fast uploads (direct to Cloudinary)

**For Users:**
- ✅ Faster video loading (CDN delivery)
- ✅ Better quality (optimized encoding)
- ✅ Worldwide fast access
- ✅ Adaptive streaming (adjusts to connection speed)

**For Website:**
- ✅ No Vercel storage limits
- ✅ No bandwidth costs
- ✅ Professional video hosting
- ✅ Automatic backups

---

## 🔒 Security Notes

- ✅ Upload preset must be **Unsigned** for browser uploads
- ✅ API Secret is NOT needed (keep it private)
- ✅ Only Cloud Name, API Key, and Upload Preset are public
- ✅ Cloudinary handles all security

---

## 📞 Need Help?

If you have any issues:
1. Check that upload preset is **Unsigned**
2. Verify credentials are correct
3. Make sure `.env.local` file exists
4. Restart the development server after adding credentials

---

## ✨ Ready to Go!

Once you provide the credentials, I'll implement everything in about 5 minutes! 🚀

