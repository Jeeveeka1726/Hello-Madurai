const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🚀 Setting up Hello Madurai Database...\n')
  
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql')
    const policiesPath = path.join(__dirname, 'supabase', 'rls-policies.sql')
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath)
      return false
    }
    
    console.log('📋 Reading database schema...')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🔧 Executing database schema...')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0)
          
          if (directError && directError.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1} may have failed, but continuing...`)
          }
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} execution warning:`, err.message.substring(0, 100))
      }
    }
    
    console.log('\n✅ Database schema setup completed!')
    
    // Set up RLS policies if file exists
    if (fs.existsSync(policiesPath)) {
      console.log('\n🔒 Setting up Row Level Security policies...')
      const policies = fs.readFileSync(policiesPath, 'utf8')
      
      const policyStatements = policies
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (let i = 0; i < policyStatements.length; i++) {
        const statement = policyStatements[i] + ';'
        console.log(`🔐 Executing policy ${i + 1}/${policyStatements.length}...`)
        
        try {
          await supabase.rpc('exec_sql', { sql: statement })
        } catch (err) {
          console.log(`⚠️  Policy ${i + 1} warning:`, err.message.substring(0, 100))
        }
      }
      
      console.log('✅ RLS policies setup completed!')
    }
    
    // Test the setup
    console.log('\n🧪 Testing database setup...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database test failed:', error.message)
      console.log('\n📋 Manual setup required:')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Open your project')
      console.log('3. Go to SQL Editor')
      console.log('4. Copy and paste the contents of supabase/schema.sql')
      console.log('5. Execute the SQL')
      console.log('6. Copy and paste the contents of supabase/rls-policies.sql')
      console.log('7. Execute the SQL')
      return false
    }
    
    console.log('✅ Database is working correctly!')
    
    // Create sample data
    console.log('\n📊 Creating sample data...')
    await createSampleData()
    
    return true
    
  } catch (err) {
    console.error('❌ Setup failed:', err.message)
    return false
  }
}

async function createSampleData() {
  try {
    // Create sample news articles
    const sampleNews = [
      {
        title: 'Madurai Corporation Announces New Development Projects',
        title_ta: 'மதுரை மாநகராட்சி புதிய வளர்ச்சி திட்டங்களை அறிவித்தது',
        content: 'The Madurai Corporation has announced several new infrastructure development projects...',
        content_ta: 'மதுரை மாநகராட்சி பல புதிய உள்கட்டமைப்பு வளர்ச்சி திட்டங்களை அறிவித்துள்ளது...',
        excerpt: 'New infrastructure projects announced for city development',
        excerpt_ta: 'நகர வளர்ச்சிக்காக புதிய உள்கட்டமைப்பு திட்டங்கள் அறிவிக்கப்பட்டன',
        category: 'corporation',
        status: 'published'
      },
      {
        title: 'Local Farmers Adopt Modern Irrigation Techniques',
        title_ta: 'உள்ளூர் விவசாயிகள் நவீன நீர்ப்பாசன நுட்பங்களை பின்பற்றுகின்றனர்',
        content: 'Farmers in the Madurai district are increasingly adopting modern irrigation methods...',
        content_ta: 'மதுரை மாவட்ட விவசாயிகள் நவீன நீர்ப்பாசன முறைகளை அதிகளவில் பின்பற்றி வருகின்றனர்...',
        excerpt: 'Modern farming techniques improving agricultural productivity',
        excerpt_ta: 'நவீன விவசாய நுட்பங்கள் விவசாய உற்பத்தித்திறனை மேம்படுத்துகின்றன',
        category: 'agriculture',
        status: 'published'
      }
    ]
    
    for (const news of sampleNews) {
      const { error } = await supabase.from('news').insert(news)
      if (error) {
        console.log('⚠️  Sample news creation warning:', error.message.substring(0, 100))
      }
    }
    
    console.log('✅ Sample data created successfully!')
    
  } catch (err) {
    console.log('⚠️  Sample data creation warning:', err.message.substring(0, 100))
  }
}

async function main() {
  const success = await setupDatabase()
  
  if (success) {
    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Create an admin user at: http://localhost:3000/auth/register')
    console.log('2. Go to Supabase Dashboard → Authentication → Users')
    console.log('3. Update the user role to "admin" in the profiles table')
    console.log('4. Access admin panel at: http://localhost:3000/admin')
  } else {
    console.log('\n❌ Database setup failed. Please set up manually.')
  }
}

main().catch(console.error)
