import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { GoogleAuth } from 'google-auth-library'

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // Path to your service account key file
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      'c:\\Users\\HP\\Documents\\freelancing\\hello_madurai\\hello-madurai-firebase-adminsdk-fbsvc-b5d2a45be2.json'
    
    try {
      const serviceAccount = require(serviceAccountPath)
      
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      })
      
      console.log('Firebase Admin initialized successfully')
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error)
      throw error
    }
  }
}

// Get FCM messaging instance
export const getFirebaseMessaging = () => {
  initializeFirebaseAdmin()
  return getMessaging()
}

// Get OAuth2 access token for FCM v1 API
export const getAccessToken = async (): Promise<string> => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      'c:\\Users\\HP\\Documents\\freelancing\\hello_madurai\\hello-madurai-firebase-adminsdk-fbsvc-b5d2a45be2.json'
    
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    })
    
    const accessToken = await auth.getAccessToken()
    return accessToken || ''
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

// FCM v1 API endpoint
export const getFCMEndpoint = (projectId: string) => {
  return `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`
}

export default initializeFirebaseAdmin
