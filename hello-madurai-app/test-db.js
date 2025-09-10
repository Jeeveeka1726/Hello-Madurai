const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('\n📋 Database schema not set up. Please:')
        console.log('1. Go to https://supabase.com/dashboard')
        console.log('2. Open your project')
        console.log('3. Go to SQL Editor')
        console.log('4. Run the contents of supabase/schema.sql')
        console.log('5. Run the contents of supabase/rls-policies.sql')
      }
      
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Test if we have any profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profileError) {
      console.error('❌ Error querying profiles:', profileError.message)
      return false
    }
    
    console.log(`📊 Found ${profiles.length} user profiles in database`)
    
    if (profiles.length === 0) {
      console.log('\n👤 No users found. To create an admin user:')
      console.log('1. Visit http://localhost:3000/auth/register')
      console.log('2. Create an account')
      console.log('3. Go to Supabase Dashboard → Authentication → Users')
      console.log('4. Update the user role to "admin" in the profiles table')
    } else {
      console.log('\n👥 Existing users:')
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name || profile.email} (${profile.role})`)
      })
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    return false
  }
}

async function testFirebase() {
  console.log('\n🔥 Testing Firebase configuration...')
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }
  
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key)
  
  if (missingKeys.length > 0) {
    console.log('⚠️  Missing Firebase configuration:')
    missingKeys.forEach(key => console.log(`  - ${key}`))
  } else {
    console.log('✅ Firebase configuration complete')
  }
  
  // Check service account
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (serviceAccountPath) {
    const fs = require('fs')
    if (fs.existsSync(serviceAccountPath)) {
      console.log('✅ Firebase service account file found')
    } else {
      console.log('❌ Firebase service account file not found at:', serviceAccountPath)
    }
  } else {
    console.log('⚠️  Firebase service account path not configured')
  }
}

async function main() {
  console.log('🚀 Hello Madurai - Backend Test\n')
  
  const dbOk = await testDatabase()
  await testFirebase()
  
  console.log('\n' + '='.repeat(50))
  
  if (dbOk) {
    console.log('✅ Backend is ready!')
    console.log('🌐 Frontend: http://localhost:3000')
    console.log('🔧 Admin: http://localhost:3000/admin')
  } else {
    console.log('❌ Backend setup required')
    console.log('📖 See STARTUP_GUIDE.md for detailed instructions')
  }
}

main().catch(console.error)
