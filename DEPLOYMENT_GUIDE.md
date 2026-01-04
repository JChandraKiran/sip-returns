# Deployment Guide - Vercel

Quick guide to deploy your SIP Returns app to Vercel.

---

## 🚀 Step 1: Deploy Backend (5 minutes)

### 1.1 Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 1.2 Deploy Backend

```bash
# Navigate to backend
cd backend

# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel
```

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? `sip-returns-backend` (or your choice)
- Directory? Press Enter (current directory)
- Override settings? **N**

### 1.3 Add Environment Variables

After deployment, go to Vercel dashboard:
1. Open your project → **Settings** → **Environment Variables**
2. Add these variables:

```
PG_HOST = aws-1-ap-south-1.pooler.supabase.com
PG_USER = postgres.zkfyqusvwnfkysqojqaz
PG_PASS = DCA@2025kiran
PG_NAME = postgres
PG_PORT = 6543
ALCHEMY_API_KEY = 21QGlZ9620ld2erifQ0M5g5Ewuho6XJ6
```

3. Set for: **Production**, **Preview**, and **Development**
4. Click **Save**

### 1.4 Redeploy

```bash
# Redeploy to apply environment variables
vercel --prod
```

### 1.5 Get Your Backend URL

After deployment completes, you'll see:
```
✅ Production: https://sip-returns-backend.vercel.app
```

**Save this URL!** You'll need it for frontend.

### 1.6 Test Backend

```bash
# Test min-dates endpoint
curl https://YOUR-BACKEND-URL.vercel.app/api/min-dates

# Test sip-returns endpoint
curl "https://YOUR-BACKEND-URL.vercel.app/api/sip-returns?cryptocurrency=btc&method=dca&fromDate=2024-01-01&toDate=2024-12-31&frequency=daily&amount=10"
```

---

## 🎨 Step 2: Deploy Frontend (5 minutes)

### 2.1 Create Frontend `.env` File

```bash
cd ../frontend
```

Create `.env.production`:

```env
VITE_BACKEND_URL=https://YOUR-BACKEND-URL.vercel.app
```

Replace `YOUR-BACKEND-URL` with your actual backend URL from Step 1.5.

### 2.2 Update `Home.jsx` to Use Backend URL

Your frontend currently uses `/api` which works locally with proxy. For production, we need to use the full backend URL.

Check if your axios calls use the backend URL or just `/api`.

### 2.3 Deploy Frontend

```bash
# Make sure you're in frontend directory
cd frontend

# Deploy
vercel
```

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? `sip-returns-frontend` (or your choice)
- Directory? Press Enter (current directory)
- Override settings? **N**

### 2.4 Add Environment Variable

After deployment:
1. Go to Vercel dashboard → Your frontend project
2. **Settings** → **Environment Variables**
3. Add:
   ```
   VITE_BACKEND_URL = https://YOUR-BACKEND-URL.vercel.app
   ```
4. Set for: **Production**, **Preview**, and **Development**
5. Click **Save**

### 2.5 Deploy to Production

```bash
vercel --prod
```

### 2.6 Get Your Frontend URL

After deployment:
```
✅ Production: https://sip-returns-frontend.vercel.app
```

---

## ✅ Step 3: Test Production

1. Open your frontend URL: `https://sip-returns-frontend.vercel.app`
2. Open browser DevTools (F12)
3. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
4. Refresh page
5. Test calculations with different tokens and frequencies
6. Check Network tab to verify API calls work

---

## 🎯 Quick Checklist

### Backend Deployment ✅
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] `/api/min-dates` works
- [ ] `/api/sip-returns` works

### Frontend Deployment ✅
- [ ] Backend URL configured
- [ ] Deployed to Vercel
- [ ] Environment variable added
- [ ] Can access the site
- [ ] Calculations work
- [ ] No CORS errors

---

## 🔧 Troubleshooting

### CORS Errors

If you get CORS errors, update your backend API files to allow your frontend domain.

In `backend/api/*.js`, update the CORS headers:

```javascript
const allowedOrigin = process.env.NODE_ENV === "production"
  ? "https://YOUR-FRONTEND-URL.vercel.app"
  : "http://localhost:5173";

res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
```

### API Calls Failing

Check if frontend is calling the right backend URL:
1. Open DevTools → Network tab
2. Check API calls - should go to `https://YOUR-BACKEND-URL.vercel.app/api/...`
3. If going to wrong URL, check `VITE_BACKEND_URL` environment variable

### Environment Variables Not Working

1. Make sure you redeployed after adding variables
2. Check variable names are correct (case-sensitive)
3. Verify they're set for Production environment

---

## 📝 Custom Domains (Optional)

### Add Custom Domain to Frontend

1. Go to Vercel dashboard → Your frontend project
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `sipreturns.com`)
4. Follow DNS configuration instructions
5. Update CORS in backend to allow your custom domain

### Add Custom Domain to Backend

1. Go to Vercel dashboard → Your backend project
2. Click **Settings** → **Domains**
3. Add your API domain (e.g., `api.sipreturns.com`)
4. Update `VITE_BACKEND_URL` in frontend to use new domain

---

## 🚀 Future Deployments

After initial setup, deploying updates is simple:

```bash
# Backend updates
cd backend
vercel --prod

# Frontend updates
cd frontend
vercel --prod
```

Or just push to GitHub and enable auto-deployment in Vercel settings!

---

## 📊 Summary

**Backend**: `https://YOUR-BACKEND-URL.vercel.app`
**Frontend**: `https://YOUR-FRONTEND-URL.vercel.app`

**Total Time**: ~10-15 minutes

You're done! 🎉
