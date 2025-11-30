// Test script to check radio API
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing /api/radio-categories...\n');
    const res = await fetch('http://localhost:3000/api/radio-categories');
    const data = await res.json();
    
    console.log('Response status:', res.status);
    console.log('Number of categories:', data.length);
    console.log('\nCategories:');
    data.forEach(cat => {
      console.log(`\n- ${cat.name} (${cat.name_ta})`);
      console.log(`  Singers: ${cat.singers?.length || 0}`);
      if (cat.singers) {
        cat.singers.forEach(singer => {
          console.log(`    - ${singer.name} (${singer._count?.songs || 0} songs)`);
        });
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
