# Complete MERN Stack Backend Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher) installed
- MongoDB Atlas account
- Git (optional)

## 🚀 Step-by-Step Setup Instructions

### Step 1: Install Dependencies
Open terminal in the `backend` folder and run:
```bash
cd backend
npm install
```

### Step 2: MongoDB Atlas Setup

#### 2.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account or login
3. Create a new cluster (Free M0 tier available)

#### 2.2 Create Database User
1. Go to **Database Access** in left sidebar
2. Click **Add New Database User**
3. Choose authentication method: **Password**
4. Username: `shariq_admin` (or your choice)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

#### 2.3 Whitelist IP Address
1. Go to **Network Access** in left sidebar
2. Click **Add IP Address**
3. Option 1: Click **Allow Access from Anywhere** (0.0.0.0/0) - For development
4. Option 2: Add your current IP address - For production
5. Click **Confirm**

#### 2.4 Get Connection String
1. Go to **Database** (Clusters)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js** | Version: **4.1 or later**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Configure Environment Variables

1. In the `backend` folder, rename `.env.example` to `.env`:
```bash
mv .env.example .env
```

2. Open `.env` file and update the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration - IMPORTANT: Replace this with your connection string
MONGODB_URI=mongodb+srv://shariq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/shariq-tariqi?retryWrites=true&w=majority

# JWT Secret Keys - IMPORTANT: Change these in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-xyz123
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
FRONTEND_PRODUCTION_URL=https://yourdomain.com

# Admin Default Credentials - Change after first login
ADMIN_EMAIL=admin@shariqahmedtariqi.com
ADMIN_PASSWORD=Admin@123456
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Change `JWT_SECRET` to a random string for production
- Change admin credentials after first login

### Step 4: Seed Database (Optional but Recommended)

This will create sample data including an admin user:
```bash
npm run seed
```

You should see output like:
```
✅ MongoDB Connected
✅ Admin created: admin@shariqahmedtariqi.com
✅ 2 courses created
✅ 3 services created
```

### Step 5: Start the Backend Server

#### Development Mode (with auto-restart):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

You should see:
```
🚀 Server running in development mode on port 5000
📡 API URL: http://localhost:5000/api
🔗 Health Check: http://localhost:5000/api/health
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### Step 6: Test the API

Open your browser or Postman and test:
- Health Check: http://localhost:5000/api/health
- Get Courses: http://localhost:5000/api/courses
- Get Services: http://localhost:5000/api/services

## 🔧 Connecting Frontend to Backend

### Update Frontend API Configuration

1. In your frontend project, find `src/services/apiService.ts`
2. Update the base URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

3. Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:5000/api
```

### For Production Deployment

1. Deploy backend to services like:
   - Heroku: https://www.heroku.com
   - Railway: https://railway.app
   - Render: https://render.com
   - DigitalOcean: https://www.digitalocean.com

2. Update production `.env`:
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
FRONTEND_URL=https://your-production-domain.com
```

## 📚 API Endpoints Overview

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (Protected)

### Courses
- GET `/api/courses` - Get all courses
- GET `/api/courses/featured` - Get featured courses
- GET `/api/courses/:id` - Get single course
- POST `/api/courses` - Create course (Admin)
- PUT `/api/courses/:id` - Update course (Admin)
- DELETE `/api/courses/:id` - Delete course (Admin)

### Appointments
- POST `/api/appointments` - Book appointment
- GET `/api/appointments` - Get all appointments (Admin)
- PUT `/api/appointments/:id` - Update appointment (Admin)
- DELETE `/api/appointments/:id` - Delete appointment (Admin)

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)

### Videos
- GET `/api/videos` - Get all videos
- GET `/api/videos/featured` - Get featured videos
- POST `/api/videos` - Create video (Admin)

### Articles
- GET `/api/articles` - Get all articles
- GET `/api/articles/:id` - Get single article
- POST `/api/articles` - Create article (Admin)
- POST `/api/articles/:id/comment` - Add comment

### Services
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get single service
- POST `/api/services` - Create service (Admin)

### Contact
- POST `/api/contact` - Send contact message
- GET `/api/contact` - Get all messages (Admin)

### Newsletter
- POST `/api/newsletter/subscribe` - Subscribe to newsletter
- GET `/api/newsletter` - Get subscribers (Admin)

### Updates
- GET `/api/updates` - Get all updates
- GET `/api/updates/pinned` - Get pinned updates
- POST `/api/updates` - Create update (Admin)

## 🛠️ Troubleshooting

### MongoDB Connection Errors
- Check if IP address is whitelisted in MongoDB Atlas
- Verify connection string in `.env`
- Ensure password doesn't contain special characters (use URL encoding)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

### CORS Errors
- Add frontend URL to `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

## 📦 Project Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/             # Request handlers
├── middleware/              # Auth, error handlers
├── models/                  # Mongoose schemas
├── routes/                  # API routes
├── scripts/
│   └── seedDatabase.js      # Database seeding
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── server.js               # Main entry point
```

## 🔐 Security Best Practices
1. Change default admin credentials after first login
2. Use strong JWT_SECRET in production
3. Enable MongoDB Atlas IP whitelist in production
4. Use HTTPS in production
5. Keep dependencies updated
6. Don't commit `.env` file to Git

## 📞 Support
If you face any issues, check:
1. MongoDB Atlas connection status
2. Console logs in terminal
3. Network tab in browser DevTools
4. Backend logs for detailed errors

Happy Coding! 🚀
