# Deployment Guide - Hello Madurai

This guide will help you deploy the Hello Madurai application to production.

## 🚀 Quick Deployment Steps

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up Database**
   ```sql
   -- In Supabase SQL Editor, run these files in order:
   -- 1. supabase/schema.sql
   -- 2. supabase/rls-policies.sql
   ```

3. **Configure Storage**
   - Go to Storage in Supabase dashboard
   - Create buckets: `news-images`, `videos`, `audio`, `pdfs`, `directory-images`
   - Set appropriate policies for public access

### 2. Vercel Deployment

1. **Connect Repository**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXTAUTH_SECRET=your-random-secret-string
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### 3. Domain Setup (Optional)

1. **Custom Domain**
   - In Vercel dashboard, go to Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **SSL Certificate**
   - Vercel automatically provides SSL
   - No additional configuration needed

## 🔧 Production Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Authentication
NEXTAUTH_SECRET=your-super-secret-string
NEXTAUTH_URL=https://your-domain.com

# Optional: Firebase for Push Notifications
NEXT_PUBLIC_FCM_VAPID_KEY=your-vapid-key
FCM_SERVER_KEY=your-server-key

# Optional: Google Translate API
GOOGLE_TRANSLATE_API_KEY=your-api-key
```

### Supabase Configuration

1. **Authentication Settings**
   - Enable email authentication
   - Set up redirect URLs for production
   - Configure email templates

2. **Storage Policies**
   ```sql
   -- Example policy for news images
   CREATE POLICY "Public news images" ON storage.objects
   FOR SELECT USING (bucket_id = 'news-images');
   
   CREATE POLICY "Authenticated users can upload news images" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');
   ```

3. **Database Optimization**
   - Enable connection pooling
   - Set up read replicas if needed
   - Monitor query performance

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Enable in Vercel dashboard
- Monitor page views and performance
- Track Core Web Vitals

### 2. Supabase Monitoring
- Monitor database performance
- Track API usage
- Set up alerts for errors

### 3. Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user behavior

## 🔒 Security Checklist

### Pre-deployment Security

- [ ] All environment variables are secure
- [ ] RLS policies are properly configured
- [ ] No sensitive data in client-side code
- [ ] CORS settings are restrictive
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented

### Post-deployment Security

- [ ] SSL certificate is active
- [ ] Security headers are configured
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Backup strategy in place

## 🚀 Performance Optimization

### 1. Next.js Optimizations
```javascript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### 2. Database Optimizations
- Add indexes for frequently queried columns
- Use database functions for complex queries
- Implement caching strategies
- Optimize image sizes and formats

### 3. CDN Configuration
- Vercel automatically provides CDN
- Configure cache headers appropriately
- Use Next.js Image optimization

## 📱 Mobile Considerations

### PWA Setup (Optional)
1. Add service worker
2. Create manifest.json
3. Enable offline functionality
4. Add to home screen capability

### Mobile Performance
- Optimize images for mobile
- Implement lazy loading
- Minimize JavaScript bundle size
- Use responsive images

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🗄️ Backup Strategy

### Database Backups
- Supabase provides automatic backups
- Set up additional backup schedule if needed
- Test restore procedures regularly

### File Storage Backups
- Implement backup for uploaded files
- Consider cross-region replication
- Document recovery procedures

## 📈 Scaling Considerations

### Database Scaling
- Monitor connection limits
- Consider read replicas for heavy read workloads
- Implement connection pooling

### Application Scaling
- Vercel handles auto-scaling
- Monitor function execution times
- Optimize for serverless environment

### Storage Scaling
- Monitor storage usage
- Implement file compression
- Consider CDN for static assets

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Review dependency versions

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Monitor connection limits

3. **Authentication Problems**
   - Verify redirect URLs
   - Check NEXTAUTH_URL setting
   - Review Supabase auth settings

### Debug Tools
- Vercel function logs
- Supabase dashboard logs
- Browser developer tools
- Network monitoring

## 📞 Support

For deployment issues:
1. Check Vercel documentation
2. Review Supabase guides
3. Contact development team
4. Community forums

---

**Ready to go live!** 🚀 Your Hello Madurai app is now production-ready.
