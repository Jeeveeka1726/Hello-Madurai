const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Hello Madurai - Complete Startup Guide\n')

async function checkDatabase() {
  console.log('🔍 Checking database connection...')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return false
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.log('❌ Database schema not set up')
      console.log('\n📋 REQUIRED: Manual Database Setup')
      console.log('=' .repeat(50))
      console.log('1. Open: https://supabase.com/dashboard')
      console.log('2. Select your project: hello-madurai')
      console.log('3. Go to: SQL Editor')
      console.log('4. Create a new query')
      console.log('5. Copy the contents of: supabase/schema.sql')
      console.log('6. Paste and run the SQL')
      console.log('7. Copy the contents of: supabase/rls-policies.sql')
      console.log('8. Paste and run the SQL')
      console.log('9. Run this script again to verify')
      console.log('=' .repeat(50))
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Check for users
    const { data: profiles } = await supabase.from('profiles').select('*').limit(5)
    console.log(`📊 Found ${profiles.length} user profiles`)
    
    if (profiles.length === 0) {
      console.log('\n👤 No admin user found')
      console.log('📋 Create admin user:')
      console.log('1. Visit: http://localhost:3000/auth/register')
      console.log('2. Create an account')
      console.log('3. Go to Supabase Dashboard → Authentication → Users')
      console.log('4. Find your user and note the ID')
      console.log('5. Go to Table Editor → profiles')
      console.log('6. Update the role column to "admin"')
    } else {
      console.log('\n👥 Existing users:')
      profiles.forEach(profile => {
        const status = profile.role === 'admin' ? '👑 ADMIN' : '👤 USER'
        console.log(`  ${status} ${profile.full_name || profile.email}`)
      })
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Database error:', err.message)
    return false
  }
}

function checkFirebase() {
  console.log('\n🔥 Checking Firebase configuration...')
  
  const firebaseConfig = {
    'API Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'Project ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'Messaging Sender ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'App ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    'VAPID Key': process.env.NEXT_PUBLIC_FCM_VAPID_KEY
  }
  
  const missing = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key)
  
  if (missing.length > 0) {
    console.log('⚠️  Missing Firebase configuration:')
    missing.forEach(key => console.log(`  - ${key}`))
  } else {
    console.log('✅ Firebase configuration complete')
  }
  
  // Check service account
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    console.log('✅ Firebase service account file found')
    return true
  } else {
    console.log('⚠️  Firebase service account file missing')
    console.log('📋 For push notifications, ensure the service account file exists at:')
    console.log(`   ${serviceAccountPath}`)
    return false
  }
}

function showStartupInstructions() {
  console.log('\n🚀 STARTUP INSTRUCTIONS')
  console.log('=' .repeat(50))
  console.log('1. Ensure database is set up (see above)')
  console.log('2. Start the development server:')
  console.log('   npm run dev')
  console.log('3. Open your browser:')
  console.log('   Frontend: http://localhost:3000/en')
  console.log('   Tamil: http://localhost:3000/ta')
  console.log('   Admin: http://localhost:3000/admin')
  console.log('   Login: http://localhost:3000/auth/login')
  console.log('=' .repeat(50))
}

function showFeatureStatus() {
  console.log('\n📋 FEATURE STATUS')
  console.log('=' .repeat(50))
  console.log('✅ Frontend Application')
  console.log('  - Home page with navigation')
  console.log('  - News section')
  console.log('  - Events calendar')
  console.log('  - Radio station page')
  console.log('  - Magazine with PDF downloads')
  console.log('  - Videos gallery')
  console.log('  - Business directory')
  console.log('  - Language toggle (English/Tamil)')
  console.log('')
  console.log('✅ Admin Dashboard')
  console.log('  - Content management interface')
  console.log('  - Statistics overview')
  console.log('  - User management')
  console.log('')
  console.log('✅ Authentication')
  console.log('  - User registration/login')
  console.log('  - Role-based access control')
  console.log('  - Demo login (admin@hellomadurai.com / admin123)')
  console.log('')
  console.log('✅ Assets Integrated')
  console.log('  - Logo: logo.jpg')
  console.log('  - FM Logo: fm-logo.jpg')
  console.log('  - Magazines: 3 PDF files')
  console.log('=' .repeat(50))
}

async function main() {
  const dbOk = await checkDatabase()
  const firebaseOk = checkFirebase()
  
  showFeatureStatus()
  showStartupInstructions()
  
  console.log('\n🎯 QUICK START')
  console.log('=' .repeat(50))
  
  if (dbOk) {
    console.log('✅ Database ready')
    console.log('🚀 You can start the application now!')
    console.log('')
    console.log('Run: npm run dev')
    console.log('Then visit: http://localhost:3000/en')
  } else {
    console.log('❌ Database setup required first')
    console.log('📖 Follow the database setup instructions above')
  }
  
  if (!firebaseOk) {
    console.log('⚠️  Push notifications will not work without Firebase setup')
  }
  
  console.log('=' .repeat(50))
  console.log('📚 For detailed instructions, see: STARTUP_GUIDE.md')
}

main().catch(console.error)
