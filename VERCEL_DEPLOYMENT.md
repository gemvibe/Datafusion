# 🚀 Vercel Deployment Guide - Hope Link

This guide will help you deploy Hope Link to Vercel in minutes.

## ✅ Pre-Deployment Checklist

- [x] Production build tested successfully
- [x] All TypeScript types validated
- [x] Supabase database configured
- [x] Environment variables documented

## 📋 Step-by-Step Deployment

### 1. Push to GitHub (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Hope Link ready for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js - click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from project directory
vercel

# For production deployment
vercel --prod
```

### 3. Configure Environment Variables in Vercel

After importing, add these environment variables in Vercel Dashboard:

**Go to: Project Settings → Environment Variables**

#### Required Variables:

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fwptmspvyazjbvcnfvsp.supabase.co` | Your Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase → Settings → API (⚠️ Keep secret!) |
| `GOOGLE_GEMINI_API_KEY` | `AIzaSyA9xS0bl108AN_DwxsHRG8JUlwPkkQCb20` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `OPENWEATHERMAP_API_KEY` | `cfb33903d6f54307362970fae392e3e9` | [OpenWeatherMap](https://openweathermap.org/api) |

#### ⚠️ Important Security Notes:

- **Copy values from your `.env.local` file**
- Set environment scope to **"Production", "Preview", and "Development"**
- Never commit `.env.local` to Git
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - keep it secret!

### 4. Update Supabase Settings

After deployment, update your Supabase project settings:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `fwptmspvyazjbvcnfvsp`
3. Go to **Settings → Auth → URL Configuration**
4. Add these URLs:

   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project.vercel.app/login`
     - `https://your-project.vercel.app/dashboard`
     - `https://*.vercel.app/*` (for preview deployments)

### 5. Verify Deployment

1. Wait for deployment to complete (~2-3 minutes)
2. Click the deployment URL
3. Test key features:
   - ✅ Sign up / Login
   - ✅ Dashboard loads
   - ✅ Create incident
   - ✅ Chatbot responds
   - ✅ Map displays

## 🎯 Post-Deployment

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update Supabase redirect URLs

### Performance Optimization

- ✅ Automatic: Edge caching
- ✅ Automatic: Image optimization
- ✅ Automatic: Compression
- ✅ Automatic: SSL certificate

### Monitoring

View deployment logs and analytics:
- **Deployments**: See all builds and their status
- **Analytics**: Track usage and performance
- **Speed Insights**: Monitor page load times

## 🔧 Troubleshooting

### Build Fails

**Problem**: TypeScript errors or missing dependencies

```bash
# Test locally first
npm run build

# Check for errors
npm run lint
```

### Authentication Not Working

**Problem**: Users can't log in

1. Check Supabase redirect URLs include your Vercel domain
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Check browser console for errors

### API Routes Fail

**Problem**: `/api/chat` or `/api/incidents` return errors

1. Verify `GOOGLE_GEMINI_API_KEY` is set
2. Check `SUPABASE_SERVICE_ROLE_KEY` is set
3. View Function Logs in Vercel Dashboard

### Environment Variables Not Working

**Problem**: "Missing environment variable" errors

1. Go to Project Settings → Environment Variables
2. Ensure all variables are set for Production
3. **Redeploy** after adding variables (previous deployments don't auto-update)

## 📱 Mobile & PWA Ready

Hope Link is automatically optimized for:
- 📱 Mobile devices
- 💻 Tablets
- 🖥️ Desktop
- 🌐 All modern browsers

## 🔄 Future Deployments

Every time you push to GitHub:
1. Vercel automatically builds and deploys
2. Preview deployments created for pull requests
3. Production updated when merged to `main`

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel deploys automatically!
```

## 📊 Current Configuration

- **Framework**: Next.js 16.1.6
- **Node Version**: 20.x (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Region**: iad1 (US East)

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Auth Setup](https://supabase.com/docs/guides/auth)

---

## ✨ Your URLs

After deployment, you'll receive:
- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`
- **Custom**: Your domain (if configured)

---

**🎉 Congratulations! Hope Link is now deployed and accessible worldwide!**
