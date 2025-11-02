# 📹 Video Embedding Guide - YouTube Shorts & Instagram Reels

## ✅ What's Been Implemented

### Supported Video Types:

1. **YouTube Regular Videos** ✅
   - Standard YouTube videos (youtube.com/watch?v=...)
   - Embeds at 1280×720 px (16:9 aspect ratio)

2. **YouTube Shorts** ✅ NEW!
   - Short-form vertical videos (youtube.com/shorts/...)
   - Embeds at 1280×720 px (displays in 16:9 container)

3. **Instagram Reels** ✅ NEW!
   - Instagram short videos (instagram.com/reel/...)
   - Embeds at 540×720 px (9:16 vertical aspect ratio)

### Where You Can Embed Videos:

✅ **News Articles** - Admin → News → Add/Edit News  
✅ **Events** - Admin → Events → Add/Edit Event  

Both sections use the same RichTextEditor with full video support!

---

## 🎬 How to Embed Videos

### Step 1: Get the Video URL

#### **For YouTube Videos:**
1. Go to YouTube and find your video
2. Click the **Share** button
3. Copy the URL (examples):
   - Regular video: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Short video: `https://youtube.com/shorts/abc123xyz`
   - Short URL: `https://youtu.be/dQw4w9WgXcQ`

#### **For Instagram Reels:**
1. Go to Instagram and find your reel
2. Click the **three dots** (•••) on the reel
3. Click **Copy Link**
4. You'll get a URL like: `https://www.instagram.com/reel/ABC123xyz/`

### Step 2: Embed in Editor

1. **Go to Admin Panel**:
   - For News: `Admin → News → Add News` or `Edit` existing
   - For Events: `Admin → Events → Add Event` or `Edit` existing

2. **Click the ▶️ Video Button** in the editor toolbar

3. **Paste the URL** in the prompt:
   ```
   Enter YouTube URL (supports regular videos, Shorts, and Instagram Reels):
   
   Examples:
   • https://www.youtube.com/watch?v=VIDEO_ID
   • https://youtube.com/shorts/VIDEO_ID
   • https://www.instagram.com/reel/REEL_ID/
   ```

4. **Click OK** - The video will be embedded automatically!

5. **Save** your news article or event

---

## 📐 Video Display Sizes

### YouTube Videos (Regular & Shorts):

| Device | Size |
|--------|------|
| **Desktop (1024px+)** | 1280×720 px (16:9) |
| **Tablet (768-1023px)** | 100% width × 500px height |
| **Mobile (<768px)** | 100% width × 250px height |

### Instagram Reels:

| Device | Size |
|--------|------|
| **Desktop (1024px+)** | 540×720 px (9:16 vertical) |
| **Tablet (768-1023px)** | 400×600 px |
| **Mobile (<768px)** | 320×480 px |

All videos are **centered** and have **rounded corners** with **shadow effects** for a professional look!

---

## 🎯 Supported URL Formats

### ✅ YouTube - All These Work:

```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://youtube.com/shorts/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

### ✅ Instagram - All These Work:

```
https://www.instagram.com/reel/REEL_ID/
https://instagram.com/reel/REEL_ID/
https://www.instagram.com/p/POST_ID/
```

---

## 🧪 How to Test

### Test YouTube Regular Video:

1. Go to: `Admin → News → Add News`
2. Click **▶️ Video** button
3. Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Click OK
5. You should see the video embedded in the editor
6. Save and view the news article

### Test YouTube Shorts:

1. Go to: `Admin → Events → Add Event`
2. Click **▶️ Video** button
3. Paste a YouTube Shorts URL (e.g., `https://youtube.com/shorts/abc123`)
4. Click OK
5. Video embeds at 1280×720 px
6. Save and view the event

### Test Instagram Reel:

1. Go to: `Admin → News → Add News`
2. Click **▶️ Video** button
3. Paste: `https://www.instagram.com/reel/ABC123xyz/`
4. Click OK
5. You should see the reel embedded (vertical format)
6. Save and view the news article

---

## 🔧 Technical Details

### YouTube Videos:

- **Extension**: TipTap YouTube Extension
- **Domain**: `youtube-nocookie.com` (better privacy & fewer restrictions)
- **Auto-fix**: Existing `youtube.com` iframes are automatically converted to `youtube-nocookie.com`
- **Attributes**: 
  - `controls: true` - Show play/pause controls
  - `modestBranding: true` - Minimal YouTube branding
  - `allowfullscreen: true` - Full screen support

### Instagram Reels:

- **Method**: Direct iframe embed
- **URL Format**: `https://www.instagram.com/reel/{REEL_ID}/embed`
- **Attributes**:
  - `scrolling: no` - No scrollbars
  - `allowtransparency: true` - Transparent background
  - `allow: encrypted-media` - DRM support

### CSS Styling:

```css
/* YouTube Videos */
.news-content iframe[src*="youtube"] {
  width: 100%;
  max-width: 1280px;
  height: 720px;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 1.5rem auto;
  display: block;
}

/* Instagram Reels */
.news-content iframe[src*="instagram"] {
  max-width: 540px;
  height: 720px;
  aspect-ratio: 9 / 16;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 1.5rem auto;
  display: block;
}
```

---

## ⚠️ Important Notes

### Embedding Restrictions:

1. **YouTube Videos**:
   - ✅ Must be **public** (not private or unlisted)
   - ✅ Must have **embedding enabled** by the owner
   - ❌ Some videos disable embedding (you'll see "Video unavailable")

2. **Instagram Reels**:
   - ✅ Must be **public** (not private account)
   - ✅ Account must allow embedding
   - ❌ Private accounts won't embed

### Privacy & Performance:

- **YouTube**: Uses `youtube-nocookie.com` for better privacy
- **Instagram**: Loads from Instagram's CDN
- **Auto-fix**: Old YouTube embeds are automatically updated to use nocookie domain

### Mobile Responsiveness:

- All videos are **fully responsive**
- Automatically adjust to screen size
- Maintain proper aspect ratios
- Touch-friendly controls

---

## 🐛 Troubleshooting

### Problem: "Could not extract video ID from URL"

**Cause**: Invalid URL format

**Solution**: 
1. Make sure you copied the full URL
2. Check for typos
3. Use one of the supported formats listed above

### Problem: "Video unavailable" or black screen

**Causes**:
1. ❌ Video is private or unlisted
2. ❌ Owner disabled embedding
3. ❌ Video was deleted
4. ❌ Geographic restrictions

**Solutions**:
1. ✅ Use a different public video
2. ✅ Ask the owner to enable embedding
3. ✅ Test with a known working video first

### Problem: Instagram Reel not showing

**Causes**:
1. ❌ Account is private
2. ❌ Reel was deleted
3. ❌ Invalid reel ID

**Solutions**:
1. ✅ Use reels from public accounts only
2. ✅ Verify the reel still exists
3. ✅ Copy the link directly from Instagram app/website

### Problem: Video too small on mobile

**Cause**: CSS not loading properly

**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check if custom CSS is overriding styles

---

## 📊 Best Practices

### For News Articles:

1. **Use relevant videos** that add value to the story
2. **Place videos strategically** - after introducing the topic
3. **Don't overload** - 1-2 videos per article is ideal
4. **Test on mobile** - Most readers use phones
5. **Use captions** - Add text before/after video explaining what it shows

### For Events:

1. **Show venue or highlights** - Help people visualize the event
2. **Use promotional videos** - Official event trailers work great
3. **Keep it short** - 1-2 minute videos are best
4. **Update regularly** - Replace with newer content as event approaches

### General Tips:

1. **Always preview** before publishing
2. **Test the video plays** - Click play button to verify
3. **Check mobile view** - Use browser dev tools
4. **Use high-quality videos** - Avoid blurry or low-res content
5. **Respect copyright** - Only embed videos you have rights to use

---

## 📝 Examples

### Good YouTube Video URL:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Good YouTube Shorts URL:
```
https://youtube.com/shorts/abc123xyz
```

### Good Instagram Reel URL:
```
https://www.instagram.com/reel/CxYz123ABC/
```

### Bad URLs (Won't Work):
```
❌ youtube.com (missing https://)
❌ www.youtube.com (missing https://)
❌ instagram.com/username (not a reel link)
❌ facebook.com/video (not supported)
```

---

## 🚀 Future Enhancements

Potential additions (not yet implemented):

- [ ] Facebook video embeds
- [ ] Twitter/X video embeds
- [ ] Vimeo video embeds
- [ ] TikTok video embeds
- [ ] Custom video upload (direct hosting)

---

**Last Updated**: November 2025  
**Version**: 2.0  
**Author**: Hello Madurai Development Team

