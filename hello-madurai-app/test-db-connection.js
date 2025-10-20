// Test database connection with different passwords
const mysql = require('mysql2/promise');

async function testConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'srv1022.hstgr.io',
      port: 3306,
      user: 'u449309789_hellomadurai25',
      password: password,
      database: 'u449309789_hello_madurai'
    });
    
    console.log('✅ CONNECTION SUCCESSFUL with password:', password);
    await connection.end();
    return true;
  } catch (error) {
    console.log('❌ FAILED with password:', password);
    console.log('   Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing database connection...\n');
  
  // Test different password formats
  const passwords = [
    'Ramesh7hello$madurai',        // Current in .env
    '8YOm?ywb|',                   // Old password you provided
    'Ramesh7hellomadurai',         // Without special char
    'Ramesh7hello%24madurai',      // URL encoded version
  ];
  
  for (const pwd of passwords) {
    await testConnection(pwd);
    console.log('');
  }
}

main();


