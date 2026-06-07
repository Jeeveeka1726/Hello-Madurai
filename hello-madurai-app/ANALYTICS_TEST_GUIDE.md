# Analytics Dashboard - Testing Guide

## 🎯 Overview
The Hello Madurai platform has a comprehensive analytics dashboard that tracks user engagement, content performance, and platform growth.

## 📊 **Analytics Features**

### **1. Key Metrics Cards**
Shows real-time statistics:
- ✅ **Total Views** - All content views (news, videos, radio)
- ✅ **Total Likes** - User engagement
- ✅ **Total Comments** - User interactions
- ✅ **Subscriptions** - Newsletter subscribers

### **2. Content Statistics**
Breakdown by content type:
- ✅ News Articles count
- ✅ Videos count
- ✅ Radio Shows count
- ✅ Businesses count
- ✅ Events count
- ✅ Magazines count
- ✅ Reels count

### **3. Engagement Chart**
Interactive chart showing:
- ✅ Views over time
- ✅ Likes over time
- ✅ Comments over time
- ✅ Switchable metrics (7d, 30d, 90d)

### **4. Top Content**
- ✅ Most viewed content
- ✅ By content type
- ✅ Sorted by performance

### **5. Recent Activity**
- ✅ Latest interactions
- ✅ Time-stamped events

---

## 🧪 **How to Test**

### **Step 1: Access Admin Dashboard**
```
1. Go to http://localhost:4000/admin
2. Click "Analytics" tab
3. Analytics dashboard should load
```

### **Step 2: Check API Endpoint**
```bash
# Test analytics API
curl http://localhost:4000/api/admin/analytics?range=30d
```

**Expected Response:**
```json
{
  "totalViews": 1234,
  "totalLikes": 567,
  "totalComments": 89,
  "totalSubscriptions": 45,
  "contentStats": {
    "news": 50,
    "videos": 30,
    "radio": 20,
    "businesses": 100,
    "events": 15
  },
  "topContent": [...],
  "userEngagement": [...],
  "summary": {...}
}
```

### **Step 3: Test Time Range Filters**
1. Click "7d" button → Shows last 7 days data
2. Click "30d" button → Shows last 30 days data
3. Click "90d" button → Shows last 90 days data

### **Step 4: Test Chart Metrics**
1. Click "views" → Chart shows views
2. Click "likes" → Chart shows likes
3. Click "comments" → Chart shows comments

---

## 🔍 **What Analytics Tracks**

### **News Articles:**
- Views count
- Likes count
- Dislikes count
- Comments count
- Shares count

### **Videos:**
- Views count
- Likes count
- Watch time (if implemented)
- Shares count

### **Radio Shows:**
- Play count
- Listen time

### **Events:**
- View count
- RSVP count (if implemented)

### **Businesses:**
- View count
- Click-through rate
- Phone clicks
- Location clicks

---

## ✅ **Verification Checklist**

- [ ] Analytics tab loads without errors
- [ ] Key metrics display correct numbers
- [ ] Content statistics show accurate counts
- [ ] Engagement chart renders properly
- [ ] Time range filters work (7d, 30d, 90d)
- [ ] Chart metric switcher works (views, likes, comments)
- [ ] Top content list displays
- [ ] Recent activity shows latest actions
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: API Returns Empty Data**
**Cause:** No content in database
**Fix:** Add some test content (news, videos, etc.)

### **Issue 2: Chart Not Rendering**
**Cause:** Missing engagement data
**Fix:** Check if userEngagement array has data in API response

### **Issue 3: Loading Forever**
**Cause:** API endpoint not responding
**Fix:** Check server logs, ensure database is connected

---

## 📱 **Mobile Testing**

1. Open admin on mobile device
2. Switch to Analytics tab
3. Verify:
   - Cards stack vertically
   - Chart is responsive
   - All content is readable

---

## 🚀 **Next Steps**

To improve analytics, consider adding:
- Real-time updates (WebSocket)
- Export to CSV/Excel
- Custom date ranges
- Geographic data
- User demographics
- Conversion tracking
