# Security Guide for Hello Madurai

## 🔒 Current Security Measures

### 1. SSL/TLS Certificates
- **Provider:** Let's Encrypt (via Vercel)
- **Auto-renewal:** Yes (every 90 days)
- **Domains covered:**
  - ✅ `hellomadurai.com`
  - ✅ `www.hellomadurai.com`
  - ✅ `hello-madurai-c5xr.vercel.app`
- **Expiry:** Automatically renewed before expiration
- **Action required:** None - Vercel handles this automatically

### 2. Security Headers (Configured in `next.config.ts`)

#### Strict-Transport-Security (HSTS)
```
max-age=63072000; includeSubDomains; preload
```
- **Purpose:** Forces HTTPS connections for 2 years
- **Benefit:** Prevents SSL downgrade attacks
- **Preload:** Submitted to browser HSTS preload lists

#### Content-Security-Policy (CSP)
- **Purpose:** Prevents XSS (Cross-Site Scripting) attacks
- **Configured for:** YouTube embeds, Instagram embeds, Google Ads

#### X-Frame-Options
```
SAMEORIGIN
```
- **Purpose:** Prevents clickjacking attacks
- **Benefit:** Your site can only be embedded in same-origin frames

#### X-Content-Type-Options
```
nosniff
```
- **Purpose:** Prevents MIME type sniffing
- **Benefit:** Browsers won't guess content types

#### Referrer-Policy
```
strict-origin-when-cross-origin
```
- **Purpose:** Controls referrer information sent to other sites
- **Benefit:** Privacy protection for users

#### Permissions-Policy
```
camera=(), microphone=(), geolocation=(self)
```
- **Purpose:** Controls browser features
- **Benefit:** Prevents unauthorized access to device features

---

## 🛡️ Best Practices

### Domain Management

1. **Always use HTTPS**
   - ✅ Configured: Both domains redirect to HTTPS
   - ✅ HSTS enabled: Browsers remember to use HTTPS

2. **Domain Configuration**
   - ✅ Both `hellomadurai.com` and `www.hellomadurai.com` configured in Vercel
   - ✅ SSL certificates auto-renewed
   - ✅ DNS points to Vercel

### Environment Variables

**Never commit sensitive data to Git:**
- ✅ `.env` files are in `.gitignore`
- ✅ Database credentials stored in Vercel environment variables
- ✅ API keys stored securely

**Current environment variables (set in Vercel):**
- `DATABASE_URL` - MySQL connection string
- `NEXT_PUBLIC_SITE_URL` - Public site URL
- `DIRECT_URL` - Direct database connection

### Database Security

1. **Connection Security**
   - ✅ SSL/TLS encrypted connections to MySQL
   - ✅ Credentials stored in environment variables
   - ✅ Prisma ORM prevents SQL injection

2. **Access Control**
   - ✅ Database hosted on Hostinger with firewall
   - ✅ Limited access to specific IPs (if configured)

---

## 🚨 Preventing Future SSL Issues

### Issue: Browser Cache After Domain Migration

**What happened:**
- Domain moved from Hostinger to Vercel
- Browsers cached old SSL certificate
- Users saw security errors

**Prevention:**

1. **Plan domain migrations carefully**
   - Set up new hosting first
   - Test SSL before switching DNS
   - Announce maintenance window to users

2. **Clear cache instructions for users**
   - Provide clear instructions on social media
   - Create a help page with cache clearing steps

3. **Use consistent SSL provider**
   - Vercel auto-manages SSL (Let's Encrypt)
   - No manual intervention needed
   - Certificates auto-renew every 90 days

### Issue: Mixed Content Warnings

**Prevention:**
- ✅ All internal links use relative URLs
- ✅ External resources loaded via HTTPS
- ✅ Image API serves over HTTPS

---

## 📋 Security Checklist

### Monthly Checks
- [ ] Verify SSL certificates are valid (auto-renewed by Vercel)
- [ ] Check Vercel deployment logs for errors
- [ ] Review security headers in browser DevTools
- [ ] Test both `hellomadurai.com` and `www.hellomadurai.com`

### After Code Changes
- [ ] Review security headers in `next.config.ts`
- [ ] Test HTTPS on all pages
- [ ] Verify CSP doesn't block legitimate resources
- [ ] Check for mixed content warnings

### After Domain Changes
- [ ] Verify DNS propagation (use https://dnschecker.org)
- [ ] Test SSL on all domains
- [ ] Clear browser cache and test
- [ ] Announce changes to users

---

## 🔧 Troubleshooting

### Users Report SSL Errors

**Solution 1: Clear Browser Cache**
```
Chrome: chrome://settings/clearBrowserData
Firefox: about:preferences#privacy
Safari: Safari > Clear History
```

**Solution 2: Clear HSTS Cache**
```
Chrome: chrome://net-internals/#hsts
Delete domain: hellomadurai.com and www.hellomadurai.com
```

**Solution 3: Wait for DNS Propagation**
- DNS changes take 5 minutes to 48 hours
- Check status: https://dnschecker.org

### SSL Certificate Not Renewing

**Vercel handles this automatically, but if issues occur:**
1. Check Vercel dashboard for errors
2. Verify domain ownership in Vercel
3. Contact Vercel support if needed

---

## 📞 Support

### For Users Experiencing Issues

**English:**
"If you see a security error, please clear your browser cache and try again. Visit our help page for instructions."

**Tamil:**
"பாதுகாப்பு பிழையைக் காண்கிறீர்கள் என்றால், உங்கள் உலாவி தற்காலிக சேமிப்பை அழித்து மீண்டும் முயற்சிக்கவும்."

---

## ✅ Summary

**Your website is secure with:**
- ✅ Auto-renewing SSL certificates (Let's Encrypt)
- ✅ HSTS enabled (2-year max-age)
- ✅ Security headers configured
- ✅ HTTPS enforced on all pages
- ✅ Protection against XSS, clickjacking, MIME sniffing
- ✅ Database connections encrypted
- ✅ Environment variables secured

**No manual SSL management needed - Vercel handles everything automatically!** 🔒✅

