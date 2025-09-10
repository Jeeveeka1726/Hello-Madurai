# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging v1 for push notifications in the Hello Madurai app.

## 🔥 Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `hello-madurai`
4. Enable Google Analytics (optional)
5. Create project

### 2. Add Web App

1. In Firebase console, click "Add app" → Web
2. App nickname: `Hello Madurai Web`
3. Enable Firebase Hosting (optional)
4. Register app
5. Copy the Firebase config object

### 3. Enable Cloud Messaging

1. Go to Project Settings → Cloud Messaging
2. Generate Web Push certificates
3. Copy the VAPID key

## 🔑 Service Account Setup

### 1. Generate Service Account Key

1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as: `hello-madurai-firebase-adminsdk-fbsvc-b5d2a45be2.json`
5. Place it at: `c:\Users\HP\Documents\freelancing\hello_madurai\`

### 2. Update Environment Variables

Update your `.env.local` file with the Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hello-madurai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hello-madurai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hello-madurai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FCM_VAPID_KEY=your_vapid_key_here

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=c:\Users\HP\Documents\freelancing\hello_madurai\hello-madurai-firebase-adminsdk-fbsvc-b5d2a45be2.json
```

## 🗄️ Database Setup

Run the updated SQL schema to add FCM tables:

```sql
-- FCM tokens table for push notifications
CREATE TABLE fcm_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'ta')),
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Notification logs table
CREATE TABLE notification_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    title_ta TEXT,
    body_ta TEXT,
    target_type TEXT NOT NULL,
    target_value TEXT,
    content_type TEXT,
    content_id UUID,
    image_url TEXT,
    click_action TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    sent_by UUID REFERENCES profiles(id)
);
```

## 🌐 Service Worker Configuration

Update the `public/firebase-messaging-sw.js` file with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your_api_key_here",
  authDomain: "hello-madurai.firebaseapp.com",
  projectId: "hello-madurai",
  storageBucket: "hello-madurai.appspot.com",
  messagingSenderId: "your_sender_id_here",
  appId: "your_app_id_here"
}
```

## 🚀 Testing Notifications

### 1. Test from Admin Panel

1. Login as admin
2. Go to admin dashboard
3. Use the "Send Notification" component
4. Send a test notification to "all" topic

### 2. Test with FCM Console

1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Select your app
5. Send test message

### 3. Test with API

```bash
curl -X POST http://localhost:3000/api/fcm/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "topic",
    "target": "all",
    "title": "Test Notification",
    "body": "This is a test message",
    "title_ta": "சோதனை அறிவிப்பு",
    "body_ta": "இது ஒரு சோதனை செய்தி"
  }'
```

## 📱 Client Integration

### 1. Initialize FCM in App

Add to your main layout or app component:

```typescript
import { initializeFCM } from '@/lib/firebase/client'

useEffect(() => {
  if (user) {
    initializeFCM(user.id, locale)
  }
}, [user, locale])
```

### 2. Add Notification Manager

Include the NotificationManager component in user settings:

```typescript
import NotificationManager from '@/components/notifications/NotificationManager'

<NotificationManager userId={user?.id} />
```

## 🔧 Advanced Configuration

### 1. Topic Management

Users are automatically subscribed to topics based on their preferences:
- `all_en` / `all_ta` - General notifications
- `news_en` / `news_ta` - News updates
- `events_en` / `events_ta` - Event notifications
- `jobs_en` / `jobs_ta` - Job alerts
- `emergency_en` / `emergency_ta` - Emergency alerts

### 2. Auto-Notifications

The app automatically sends notifications when:
- New news articles are published
- New events are created
- New jobs are posted
- Emergency alerts are issued

### 3. Scheduled Notifications

Set up cron jobs for:
- Event reminders (24 hours before)
- Weekly digest notifications
- Monthly magazine releases

## 🛠️ Troubleshooting

### Common Issues

1. **Service Worker Not Loading**
   - Check if `firebase-messaging-sw.js` is in the `public` folder
   - Verify the file is accessible at `/firebase-messaging-sw.js`

2. **Permission Denied**
   - User must grant notification permission
   - Check browser notification settings

3. **Token Not Generated**
   - Verify VAPID key is correct
   - Check Firebase project configuration

4. **Notifications Not Received**
   - Check if user is subscribed to the topic
   - Verify FCM token is stored in database
   - Check browser console for errors

### Debug Steps

1. **Check Browser Console**
   ```javascript
   // Test FCM token generation
   import { getFCMToken } from '@/lib/firebase/client'
   getFCMToken().then(token => console.log('FCM Token:', token))
   ```

2. **Verify Service Account**
   ```bash
   # Test service account access
   node -e "
   const admin = require('firebase-admin');
   const serviceAccount = require('./path/to/serviceAccountKey.json');
   admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
   console.log('Service account working!');
   "
   ```

3. **Test API Endpoints**
   - `/api/fcm/store-token` - Store user FCM token
   - `/api/fcm/subscribe` - Subscribe to topic
   - `/api/fcm/send-notification` - Send notification (admin only)

## 📊 Analytics & Monitoring

### 1. Firebase Analytics

Track notification performance:
- Delivery rates
- Open rates
- Click-through rates

### 2. Database Logs

Monitor notifications in the `notification_logs` table:
- Sent notifications
- Success/failure counts
- User engagement

### 3. Error Tracking

Set up error monitoring for:
- FCM token generation failures
- Notification delivery failures
- Service worker errors

## 🔒 Security Considerations

1. **Service Account Key**
   - Keep the JSON file secure
   - Never commit to version control
   - Use environment variables in production

2. **API Endpoints**
   - Admin-only endpoints are protected
   - Validate all input data
   - Rate limit notification sending

3. **User Privacy**
   - Users can opt-out of notifications
   - Store minimal device information
   - Respect user preferences

## 🚀 Production Deployment

### 1. Environment Variables

Set these in your production environment:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccount.json
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hello-madurai
NEXT_PUBLIC_FCM_VAPID_KEY=your_production_vapid_key
```

### 2. Service Worker

Ensure the service worker is properly served:
- Place in `public/` folder
- Accessible at root path
- Properly configured for production domain

### 3. Testing

Test notifications in production:
- Send test notifications to admin users
- Verify all notification types work
- Check cross-browser compatibility

---

**Your FCM v1 push notification system is now ready!** 🎉

Users will receive notifications for:
- 📰 Breaking news
- 🎉 Upcoming events  
- 💼 New job opportunities
- 🚨 Emergency alerts

The system supports both Tamil and English languages and provides a complete admin interface for managing notifications.
