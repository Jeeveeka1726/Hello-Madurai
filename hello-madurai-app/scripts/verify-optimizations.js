#!/usr/bin/env node

/**
 * Verification script for production optimizations
 * Run: node scripts/verify-optimizations.js
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';

console.log('\n🔍 Starting Production Optimization Verification...\n');

// Test 1: Check if ads API is accessible and cached
async function testAdsAPI() {
  console.log('📢 Test 1: Ads API Caching');
  
  const startTime = Date.now();
  try {
    const response = await fetch(`${SITE_URL}/api/ads/active?category=news`);
    const duration = Date.now() - startTime;
    const data = await response.json();
    const cacheStatus = response.headers.get('X-Cache');
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📦 Ads Count: ${data.length}`);
    console.log(`   🗄️  Cache Status: ${cacheStatus || 'N/A'}`);
    
    // Second request should be faster (cached)
    const start2 = Date.now();
    const response2 = await fetch(`${SITE_URL}/api/ads/active?category=news`);
    const duration2 = Date.now() - start2;
    const cacheStatus2 = response2.headers.get('X-Cache');
    
    console.log(`   🔄 Second Request: ${duration2}ms (Cache: ${cacheStatus2})`);
    
    if (duration2 < duration / 2) {
      console.log('   ✅ PASS: Caching is working!\n');
    } else {
      console.log('   ⚠️  WARNING: Cache may not be working optimally\n');
    }
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}\n`);
  }
}

// Test 2: Check if news metadata has og:image tags
async function testNewsMetadata() {
  console.log('🖼️  Test 2: News Sharing Metadata');
  
  try {
    // Get first news article
    const newsResponse = await fetch(`${SITE_URL}/api/news?limit=1`);
    const newsData = await newsResponse.json();
    
    if (newsData.length === 0) {
      console.log('   ⚠️  No news articles found to test\n');
      return;
    }
    
    const firstNews = newsData[0];
    const newsUrl = `${SITE_URL}/news/${firstNews.slug || firstNews.id}`;
    
    console.log(`   📄 Testing: ${newsUrl}`);
    
    const response = await fetch(newsUrl);
    const html = await response.text();
    
    // Check for og:image tags
    const hasOgImage = html.includes('og:image');
    const hasTwitterCard = html.includes('twitter:card');
    const hasImageUrl = html.includes('content="http');
    
    console.log(`   ${hasOgImage ? '✅' : '❌'} og:image tag present`);
    console.log(`   ${hasTwitterCard ? '✅' : '❌'} twitter:card tag present`);
    console.log(`   ${hasImageUrl ? '✅' : '❌'} Image URL present`);
    
    if (hasOgImage && hasTwitterCard && hasImageUrl) {
      console.log('   ✅ PASS: Social sharing metadata looks good!\n');
    } else {
      console.log('   ❌ FAIL: Some metadata tags are missing\n');
    }
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}\n`);
  }
}

// Test 3: Check image proxy caching
async function testImageProxy() {
  console.log('🌐 Test 3: Image Proxy Caching');
  
  try {
    const testImageUrl = encodeURIComponent('https://res.cloudinary.com/demo/image/upload/sample.jpg');
    const proxyUrl = `${SITE_URL}/api/og-image-proxy?url=${testImageUrl}`;
    
    const start1 = Date.now();
    const response1 = await fetch(proxyUrl);
    const duration1 = Date.now() - start1;
    const cacheControl = response1.headers.get('Cache-Control');
    
    console.log(`   ✅ Status: ${response1.status}`);
    console.log(`   ⏱️  Duration: ${duration1}ms`);
    console.log(`   🗄️  Cache-Control: ${cacheControl}`);
    
    if (cacheControl && cacheControl.includes('604800')) {
      console.log('   ✅ PASS: 7-day caching enabled!\n');
    } else {
      console.log('   ⚠️  WARNING: Cache duration may not be optimal\n');
    }
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}\n`);
  }
}

// Test 4: Check Next.js config optimizations
async function testBuildConfig() {
  console.log('⚙️  Test 4: Build Configuration');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const configPath = path.join(__dirname, '..', 'next.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const checks = {
      'swcMinify': configContent.includes('swcMinify: true'),
      'compress': configContent.includes('compress: true'),
      'optimizePackageImports': configContent.includes('optimizePackageImports'),
      'removeConsole': configContent.includes('removeConsole'),
    };
    
    Object.entries(checks).forEach(([feature, enabled]) => {
      console.log(`   ${enabled ? '✅' : '❌'} ${feature}`);
    });
    
    const allEnabled = Object.values(checks).every(v => v);
    if (allEnabled) {
      console.log('   ✅ PASS: All optimizations enabled!\n');
    } else {
      console.log('   ⚠️  WARNING: Some optimizations missing\n');
    }
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}\n`);
  }
}

// Run all tests
async function runTests() {
  await testAdsAPI();
  await testNewsMetadata();
  await testImageProxy();
  await testBuildConfig();
  
  console.log('✅ Verification Complete!\n');
  console.log('📊 Next Steps:');
  console.log('   1. Review any warnings or failures above');
  console.log('   2. Test manually on production site');
  console.log('   3. Monitor Core Web Vitals in Google Search Console');
  console.log('   4. Check social media sharing previews\n');
}

runTests().catch(console.error);
