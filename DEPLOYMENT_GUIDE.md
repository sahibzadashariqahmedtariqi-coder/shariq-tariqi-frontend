# 🚀 Deployment Guide - Sahibzada Shariq Ahmed Tariqi Website

## 📋 Overview
- **Frontend**: Vercel (FREE)
- **Backend**: Render (FREE)
- **Database**: MongoDB Atlas (Already setup)
- **Media**: Cloudinary (Already setup)
- **Domain**: Rs 3500/year (recommended: hostinger.pk or namecheap.com)

---

## 🔐 STEP 1: GitHub Repository Setup

### 1.1 Create GitHub Account (if not exists)
Go to: https://github.com/signup

### 1.2 Create Two Repositories
1. **Frontend Repo**: `shariq-tariqi-frontend`
2. **Backend Repo**: `shariq-tariqi-backend`

### 1.3 Push Frontend Code
```bash
cd "c:\Users\Ahmed Subhan Tariqi\Videos\Final Phase of Shariq Bhai\Shariq Bhai"

# Initialize git
git init

# Create .gitignore
# (Already created - make sure node_modules, .env are listed)

# Add files
git add .
git commit -m "Initial commit - Frontend"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/shariq-tariqi-frontend.git
git branch -M main
git push -u origin main
```

### 1.4 Push Backend Code
```bash
cd backend

# Initialize git
git init

# Add files (excluding .env)
git add .
git commit -m "Initial commit - Backend"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/shariq-tariqi-backend.git
git branch -M main
git push -u origin main
```

---

## 🖥️ STEP 2: Backend Deployment on Render

### 2.1 Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub

### 2.2 Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub `shariq-tariqi-backend` repo
3. Configure:
   - **Name**: `shariq-tariqi-api`
   - **Region**: Singapore (closest to Pakistan)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 2.3 Add Environment Variables (CRITICAL!)
Go to "Environment" tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (Generate: use online generator for 64 char random string) |
| `JWT_EXPIRE` | `7d` |
| `MONGODB_URI` | `mongodb+srv://YOUR_DB_USER:YOUR_PASSWORD@your-cluster.mongodb.net/your-database` |
| `MUREED_MONGODB_URI` | `mongodb+srv://YOUR_DB_USER:YOUR_PASSWORD@your-cluster.mongodb.net/mureedDB` |
| `CLOUDINARY_CLOUD_NAME` | `YOUR_CLOUD_NAME` |
| `CLOUDINARY_API_KEY` | `YOUR_API_KEY` |
| `CLOUDINARY_API_SECRET` | `YOUR_API_SECRET` |
| `MUREED_CLOUDINARY_CLOUD_NAME` | `YOUR_MUREED_CLOUD_NAME` |
| `MUREED_CLOUDINARY_API_KEY` | `YOUR_MUREED_API_KEY` |
| `MUREED_CLOUDINARY_API_SECRET` | `YOUR_MUREED_API_SECRET` |
| `FRONTEND_URL` | `http://localhost:3000` |
| `FRONTEND_PRODUCTION_URL` | `https://your-domain.vercel.app` |

> ⚠️ **SECURITY WARNING**: Never commit actual credentials to Git! Use environment variables only.

### 2.4 Deploy
Click "Create Web Service" and wait for deployment.

Your backend URL will be something like:
`https://shariq-tariqi-api.onrender.com`

---

## 🌐 STEP 3: Frontend Deployment on Vercel

### 3.1 Create Vercel Account
1. Go to: https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project
1. Click "Add New" → "Project"
2. Import `shariq-tariqi-frontend` repo
3. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://shariq-tariqi-api.onrender.com/api` |

### 3.4 Deploy
Click "Deploy" and wait.

Your frontend URL will be:
`https://shariq-tariqi-frontend.vercel.app`

---

## 🔄 STEP 4: Update Backend CORS

After getting Vercel URL, update Render environment variable:

| Key | Value |
|-----|-------|
| `FRONTEND_PRODUCTION_URL` | `https://shariq-tariqi-frontend.vercel.app` |

Render will automatically redeploy.

---

## 🌍 STEP 5: Custom Domain Setup

### 5.1 Buy Domain
Recommended providers (Rs 3500-4000/year):
- **Hostinger.pk**: https://hostinger.pk
- **Namecheap**: https://namecheap.com
- **GoDaddy**: https://godaddy.com

Suggested domain: `shariqahmedtariqi.com` or `shariqtariqi.com`

### 5.2 Add Domain to Vercel (Frontend)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `shariqahmedtariqi.com`
3. Add `www.shariqahmedtariqi.com`
4. Vercel will show DNS records

### 5.3 Configure DNS at Domain Registrar
Add these records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 5.4 Add Domain to Render (Backend API)
1. Go to Render Dashboard → Your Service → Settings → Custom Domains
2. Add: `api.shariqahmedtariqi.com`
3. Add DNS records:

| Type | Name | Value |
|------|------|-------|
| CNAME | api | shariq-tariqi-api.onrender.com |

### 5.5 Update Environment Variables

**Render (Backend)**:
| Key | Value |
|-----|-------|
| `FRONTEND_PRODUCTION_URL` | `https://shariqahmedtariqi.com` |

**Vercel (Frontend)**:
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://api.shariqahmedtariqi.com/api` |

---

## 🛡️ SECURITY CHECKLIST

### ✅ Already Implemented:
- [x] Helmet security headers
- [x] Rate limiting (100 req/15min, 10 login attempts/hour)
- [x] MongoDB injection sanitization
- [x] CORS whitelist
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Super Admin protection

### ⚠️ Post-Deployment Tasks:

1. **Change JWT Secret**:
   - Generate new: https://randomkeygen.com (use 504-bit WPA Key)
   - Update in Render environment variables

2. **Change Super Admin Password**:
   - Login with current credentials
   - Change password immediately

3. **MongoDB Security** (Already done - Atlas handles this):
   - IP whitelist enabled
   - Strong passwords
   - Encryption at rest

4. **Cloudinary Security** (Already done):
   - API secrets not exposed in frontend
   - Signed uploads only

---

## 🔧 TROUBLESHOOTING

### Backend not starting:
- Check Render logs
- Verify all environment variables are set
- Check MongoDB IP whitelist (add 0.0.0.0/0 for Render)

### CORS errors:
- Verify FRONTEND_PRODUCTION_URL in Render
- Clear browser cache
- Check Vercel domain matches exactly

### Images not loading:
- Check Cloudinary credentials
- Verify CORS on Cloudinary dashboard

### Login not working:
- Check JWT_SECRET is set
- Verify backend is running (health check URL)

---

## 📞 SUPPORT CONTACTS

- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/support
- **MongoDB Support**: https://support.mongodb.com

---

## 💰 COST BREAKDOWN

| Service | Cost |
|---------|------|
| Vercel (Frontend) | FREE |
| Render (Backend) | FREE |
| MongoDB Atlas | FREE (512MB) |
| Cloudinary | FREE (25GB) |
| Domain (.com) | Rs 3500-4000/year |
| **Total** | **Rs 3500-4000/year** |

---

## 🎉 After Deployment

1. Test all features
2. Create backup of database
3. Monitor Render and Vercel dashboards
4. Set up uptime monitoring (free: uptimerobot.com)

**Your website will be live at**: `https://shariqahmedtariqi.com`
