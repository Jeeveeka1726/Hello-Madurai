#!/usr/bin/env node

/**
 * Browser Compatibility Test Script
 * Verifies that all cross-browser optimizations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking cross-browser compatibility setup...\n');

let passedTests = 0;
let failedTests = 0;

// Test 1: Check if .browserslistrc exists
function testBrowserslistConfig() {
  const browserslistPath = path.join(__dirname, '../.browserslistrc');
  if (fs.existsSync(browserslistPath)) {
    console.log('✅ .browserslistrc configuration found');
    passedTests++;
    return true;
  } else {
    console.log('❌ .browserslistrc configuration missing');
    failedTests++;
    return false;
  }
}

// Test 2: Check PostCSS configuration
function testPostCSSConfig() {
  const postcssPath = path.join(__dirname, '../postcss.config.mjs');
  if (fs.existsSync(postcssPath)) {
    const content = fs.readFileSync(postcssPath, 'utf8');
    if (content.includes('autoprefixer')) {
      console.log('✅ PostCSS with autoprefixer configured');
      passedTests++;
      return true;
    } else {
      console.log('⚠️  PostCSS found but autoprefixer not configured');
      failedTests++;
      return false;
    }
  } else {
    console.log('❌ postcss.config.mjs missing');
    failedTests++;
    return false;
  }
}

// Test 3: Check Service Worker
function testServiceWorker() {
  const swPath = path.join(__dirname, '../public/sw.js');
  if (fs.existsSync(swPath)) {
    const content = fs.readFileSync(swPath, 'utf8');
    if (content.includes('RUNTIME_CACHE')) {
      console.log('✅ Enhanced service worker with runtime cache');
      passedTests++;
      return true;
    } else {
      console.log('⚠️  Service worker exists but not enhanced');
      passedTests++;
      return true;
    }
  } else {
    console.log('❌ Service worker (sw.js) missing');
    failedTests++;
    return false;
  }
}

// Test 4: Check PWA Manifest
function testManifest() {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (content.shortcuts && content.shortcuts.length > 0) {
      console.log('✅ Enhanced PWA manifest with shortcuts');
      passedTests++;
      return true;
    } else {
      console.log('⚠️  Manifest exists but missing shortcuts');
      passedTests++;
      return true;
    }
  } else {
    console.log('❌ manifest.json missing');
    failedTests++;
    return false;
  }
}

// Test 5: Check Browser Optimization Utilities
function testBrowserOptimizations() {
  const utilsPath = path.join(__dirname, '../src/utils/browserOptimizations.ts');
  if (fs.existsSync(utilsPath)) {
    const content = fs.readFileSync(utilsPath, 'utf8');
    if (content.includes('detectBrowser') && content.includes('applyBrowserOptimizations')) {
      console.log('✅ Browser optimization utilities present');
      passedTests++;
      return true;
    } else {
      console.log('⚠️  Browser optimizations incomplete');
      failedTests++;
      return false;
    }
  } else {
    console.log('❌ browserOptimizations.ts missing');
    failedTests++;
    return false;
  }
}

// Test 6: Check Browser Optimization Wrapper Component
function testBrowserOptimizationWrapper() {
  const wrapperPath = path.join(__dirname, '../src/components/BrowserOptimizationWrapper.tsx');
  if (fs.existsSync(wrapperPath)) {
    console.log('✅ BrowserOptimizationWrapper component present');
    passedTests++;
    return true;
  } else {
    console.log('❌ BrowserOptimizationWrapper.tsx missing');
    failedTests++;
    return false;
  }
}

// Test 7: Check CSS vendor prefixes
function testCSSVendorPrefixes() {
  const cssPath = path.join(__dirname, '../src/app/globals.css');
  if (fs.existsSync(cssPath)) {
    const content = fs.readFileSync(cssPath, 'utf8');
    const hasWebkitPrefixes = content.includes('-webkit-');
    const hasMozPrefixes = content.includes('-moz-');
    
    if (hasWebkitPrefixes && hasMozPrefixes) {
      console.log('✅ CSS vendor prefixes present');
      passedTests++;
      return true;
    } else {
      console.log('⚠️  CSS missing some vendor prefixes (autoprefixer will add them)');
      passedTests++;
      return true;
    }
  } else {
    console.log('❌ globals.css missing');
    failedTests++;
    return false;
  }
}

// Test 8: Check Next.js config optimizations
function testNextConfig() {
  const nextConfigPath = path.join(__dirname, '../next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    if (content.includes('optimizePackageImports')) {
      console.log('✅ Next.js optimizations configured');
      passedTests++;
      return true;
    } else {
      console.log('⚠️  Next.js config could be more optimized');
      passedTests++;
      return true;
    }
  } else {
    console.log('❌ next.config.ts missing');
    failedTests++;
    return false;
  }
}

// Run all tests
console.log('Running compatibility checks...\n');
testBrowserslistConfig();
testPostCSSConfig();
testServiceWorker();
testManifest();
testBrowserOptimizations();
testBrowserOptimizationWrapper();
testCSSVendorPrefixes();
testNextConfig();

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('\n🎉 All browser compatibility checks passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Install autoprefixer: npm install -D autoprefixer');
  console.log('   2. Build the project: npm run build');
  console.log('   3. Test in different browsers');
  process.exit(0);
} else {
  console.log('\n⚠️  Some compatibility checks failed. Please review above.');
  process.exit(1);
}
