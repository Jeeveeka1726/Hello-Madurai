# 📱 Social Media Sharing Guide - Hello Madurai Events

## ✅ What's Been Implemented

### 1. **Event Detail Pages** (`/events/[id]`)
- Individual page for each event
- SEO-optimized with Open Graph meta tags
- Tamil content preferred for social sharing
- Automatic view counter

### 2. **Open Graph Meta Tags** (for Facebook, WhatsApp, LinkedIn)
```html
<meta property="og:title" content="மதுரை சித்திரை திருவிழா" />
<meta property="og:description" content="📅 31 டிசம்பர் 2025 | 📍 மதுரை மீனாட்சி அம்மன் கோவில்..." />
<meta property="og:image" content="https://hello-madurai-c5xr.vercel.app/uploads/event-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="ta_IN" />
<meta property="og:site_name" content="Hello Madurai - ஹலோ மதுரை" />
```

### 3. **Twitter Card Meta Tags**
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="மதுரை சித்திரை திருவிழா" />
<meta name="twitter:description" content="📅 31 டிசம்பர் 2025 | 📍 மதுரை..." />
<meta name="twitter:image" content="https://hello-madurai-c5xr.vercel.app/uploads/event-image.jpg" />
```

## 🎯 What Gets Shared

When someone shares an event link on social media, they'll see:

```
┌─────────────────────────────────────────┐
│  [Featured Image - 1200×630px]          │
│  (Event photo you uploaded)             │
├─────────────────────────────────────────┤
│  மதுரை சித்திரை திருவிழா               │  ← Tamil Title
│  (or English if Tamil not available)    │
├─────────────────────────────────────────┤
│  📅 31 டிசம்பர் 2025                    │  ← Date in Tamil
│  📍 மதுரை மீனாட்சி அம்மன் கோவில்      │  ← Location in Tamil
│                                         │
│  மதுரையின் மிகப்பெரிய திருவிழா...     │  ← Description (first 160 chars)
├─────────────────────────────────────────┤
│  Hello Madurai - ஹலோ மதுரை             │  ← Site Name
└─────────────────────────────────────────┘
```

## 🚀 How to Test (After Deployment)

### **Important: Social Media Previews Don't Work on Localhost!**

Facebook, WhatsApp, and other platforms **cannot access** `localhost:3000` to fetch preview images and metadata. You **must deploy** to test social sharing.

### Step 1: Deploy to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add event detail pages with social sharing"
   git push
   ```

2. **Vercel will auto-deploy** (if connected to GitHub)
   - Or manually deploy: `vercel --prod`

3. **Wait 2-3 minutes** for deployment to complete

### Step 2: Create a Test Event

1. Go to your deployed site: `https://hello-madurai-c5xr.vercel.app/admin/events`
2. Create a new event with:
   - ✅ **Featured Image** (required for thumbnail)
   - ✅ **Tamil Title** (title_ta)
   - ✅ **Tamil Description** (description_ta)
   - ✅ **Tamil Location** (location_ta)
   - ✅ Date, Time, etc.

3. Click "Add Event"

### Step 3: Get the Event URL

1. Go to: `https://hello-madurai-c5xr.vercel.app/events`
2. Find your event
3. Click the **Share** button
4. Click **Copy Link**
5. You'll get a URL like: `https://hello-madurai-c5xr.vercel.app/events/abc123xyz`

### Step 4: Test Social Media Sharing

#### **Option A: Facebook Sharing Debugger** (Recommended)

1. Go to: https://developers.facebook.com/tools/debug/
2. Paste your event URL
3. Click "Debug"
4. You should see:
   - ✅ Event title in Tamil
   - ✅ Event description with date and location
   - ✅ Featured image (1200×630px)
   - ✅ "Hello Madurai - ஹலோ மதுரை" as site name

5. If you don't see the image:
   - Click "Scrape Again" button
   - Facebook caches previews, so you may need to scrape 2-3 times

#### **Option B: WhatsApp Test**

1. Open WhatsApp on your phone
2. Send the event URL to yourself or a friend
3. WhatsApp will show a preview with:
   - Event image
   - Tamil title
   - Date and location

#### **Option C: LinkedIn Post Preview**

1. Go to LinkedIn
2. Create a new post
3. Paste the event URL
4. LinkedIn will show a preview card

## 🖼️ Image Requirements for Best Results

### **Featured Image Specifications**:
- **Recommended Size**: 1200×630 pixels (Facebook/WhatsApp standard)
- **Minimum Size**: 600×315 pixels
- **Aspect Ratio**: 1.91:1 (landscape)
- **Format**: JPG or PNG
- **File Size**: Under 8 MB
- **Content**: Clear, high-quality event photo

### **How to Upload**:
1. In Admin → Events → Add/Edit Event
2. Click "Featured Image" upload button
3. Select your image (will auto-resize to 1280×720)
4. Save the event

## 🔧 Troubleshooting

### **Problem: No image showing in preview**

**Causes**:
1. ❌ No featured image uploaded
2. ❌ Image URL is relative (not absolute)
3. ❌ Image is too small (< 200×200)
4. ❌ Social media platform hasn't cached the page yet

**Solutions**:
1. ✅ Upload a featured image in the admin panel
2. ✅ Use Facebook Debugger to force re-scrape
3. ✅ Wait 5-10 minutes and try again
4. ✅ Make sure image is at least 600×315 pixels

### **Problem: Showing English instead of Tamil**

**Cause**: Tamil fields (title_ta, description_ta, location_ta) are empty

**Solution**: 
1. Edit the event in admin panel
2. Fill in all Tamil fields:
   - Title (Tamil)
   - Description (Tamil)
   - Location (Tamil)
3. Save and re-share

### **Problem: Old preview showing after editing event**

**Cause**: Facebook/WhatsApp cache old previews for 24-48 hours

**Solutions**:
1. Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Click "Scrape Again" to force refresh
3. For WhatsApp: Clear chat and send link again

### **Problem: 404 error when clicking event link**

**Causes**:
1. ❌ Event was deleted
2. ❌ Wrong event ID in URL
3. ❌ Database connection issue

**Solutions**:
1. Check if event exists in admin panel
2. Verify the URL is correct
3. Check server logs for errors

## 📊 What Content is Shared in Tamil

| Field | Tamil Source | Fallback |
|-------|-------------|----------|
| **Title** | `title_ta` | `title` (English) |
| **Description** | `description_ta` | `description` (English) |
| **Location** | `location_ta` | `location` (English) |
| **Date** | Tamil locale format | English format |
| **Site Name** | "Hello Madurai - ஹலோ மதுரை" | Fixed |

## 🌐 Supported Platforms

✅ **Facebook** - Full support with image, title, description  
✅ **WhatsApp** - Full support with preview card  
✅ **LinkedIn** - Full support with rich preview  
✅ **Twitter/X** - Full support with Twitter Card  
✅ **Telegram** - Full support with preview  
✅ **iMessage** - Full support with link preview  
✅ **Slack** - Full support with unfurl  

## 📝 Best Practices

### **For Best Social Media Engagement**:

1. **Always upload a featured image**
   - Use high-quality, eye-catching photos
   - Show the event venue or activity
   - Avoid text-heavy images

2. **Write compelling Tamil descriptions**
   - First 160 characters are most important
   - Include key details: date, time, location
   - Use emojis sparingly (📅 📍 🎉)

3. **Use descriptive Tamil titles**
   - Keep under 60 characters for best display
   - Include event type (திருவிழா, கண்காட்சி, etc.)

4. **Fill all Tamil fields**
   - Title (Tamil)
   - Description (Tamil)
   - Location (Tamil)
   - This ensures Tamil-speaking audience gets native content

5. **Test before sharing widely**
   - Use Facebook Debugger first
   - Check preview on WhatsApp
   - Verify all information is correct

## 🔗 Useful Links

- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **Open Graph Protocol**: https://ogp.me/

## 📞 Support

If you encounter issues with social media sharing:

1. Check this guide first
2. Use Facebook Debugger to diagnose
3. Verify all Tamil fields are filled
4. Ensure featured image is uploaded
5. Wait 5-10 minutes after publishing event

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Author**: Hello Madurai Development Team

