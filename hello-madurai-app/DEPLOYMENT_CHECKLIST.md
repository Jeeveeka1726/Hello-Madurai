# 🚀 Deployment Checklist - Social Sharing Fix

## Before Deployment

- [ ] All changes are committed
- [ ] Code builds successfully locally
- [ ] No TypeScript errors
- [ ] Environment variables are set correctly

## Deployment Steps

### 1. Build & Test Locally
```bash
cd hello-madurai-app
npm run build
```

Expected: Build completes without errors ✅

### 2. Test Share Pages Locally
```bash
# Start the server
npx next start -p 4000

# In another terminal, test the API
curl "http://localhost:4000/api/test-og?offerId=cml13flc90001jl046c1ekgo4"
```

Expected: Returns JSON with correct imageUrl ✅

### 3. Commit & Push
```bash
git add .
git commit -m "Fix social sharing meta tags for offers and e-paper"
git push origin main
```

### 4. Verify Vercel Deployment
- [ ] Go to Vercel dashboard
- [ ] Check deployment status
- [ ] Wait for deployment to complete
- [ ] Check for any build errors

### 5. Test Production URLs

Get a share URL from production:
- Offer: `https://hellomadurai.com/offers/share/[OFFER_ID]`
- E-Paper: `https://hellomadurai.com/epaper/share/[MAGAZINE_ID]`

### 6. Clear Facebook Cache (CRITICAL!)

1. Go to: https://developers.facebook.com/tools/debug/
2. Paste your production share URL
3. Click "Debug"
4. Click "Scrape Again" (2-3 times)
5. Verify the preview shows the correct cover image

### 7. Test Real Sharing

- [ ] Share on Facebook - verify correct image appears
- [ ] Share on WhatsApp - verify correct image appears
- [ ] Share on Twitter - verify correct image appears
- [ ] Share on LinkedIn - verify correct image appears

## Environment Variables to Check

Make sure these are set in Vercel:

```
NEXT_PUBLIC_BASE_URL=https://hellomadurai.com
```

Or your actual production domain.

## Quick Test Commands

```bash
# Test offer metadata
curl "https://hellomadurai.com/api/test-og?offerId=YOUR_ID" | python3 -m json.tool

# Test e-paper metadata
curl "https://hellomadurai.com/api/test-og?epaperId=YOUR_ID" | python3 -m json.tool
```

## Post-Deployment Verification

- [ ] Share pages load without errors
- [ ] Images display correctly on share pages
- [ ] Meta tags are in HTML source (view source)
- [ ] Facebook debugger shows correct image
- [ ] No console errors
- [ ] Auto-redirect works after 2 seconds

## If Something Goes Wrong

1. Check Vercel logs for errors
2. Verify environment variables in Vercel
3. Clear Facebook cache again
4. Check if images are publicly accessible
5. Review `SOCIAL_SHARING_FIX.md` for troubleshooting

## Success Criteria ✅

- [x] Offers show correct cover image when shared
- [x] E-papers show correct cover image when shared
- [x] All social platforms display correct preview
- [x] No errors in production
- [x] Users can share successfully

---

**All done?** Great! Your social sharing should now work perfectly! 🎉
