// Force Favicon Update Script
// Run this after updating favicon files to ensure Vercel deployment picks up changes

const fs = require('fs');
const path = require('path');

console.log('🔄 Forcing favicon cache bust...');

// Update timestamp in layout.tsx
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Get current timestamp
const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

// Replace old timestamp with new one
const updatedContent = layoutContent.replace(/\?t=\d{8}/g, `?t=${timestamp}`);

fs.writeFileSync(layoutPath, updatedContent);

console.log(`✅ Updated favicon timestamps to: ${timestamp}`);
console.log('📦 Now commit and push to trigger Vercel deployment');
console.log('🌐 Vercel will pick up the new favicon files');
