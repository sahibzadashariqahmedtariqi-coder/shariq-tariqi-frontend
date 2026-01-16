# Shariq Ahmed Tariqi - Backend

Complete MERN stack backend for Sahibzada Shariq Ahmed Tariqi's spiritual healing website.

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials
```

3. **Seed database (optional):**
```bash
npm run seed
```

4. **Start server:**
```bash
npm run dev
```

## 📚 Documentation

- [Complete Setup Guide](./SETUP_GUIDE.md) - Step-by-step MongoDB Atlas & backend setup
- [API Documentation](./API_DOCUMENTATION.md) - All API endpoints with examples

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📦 Features

✅ User authentication & authorization  
✅ Role-based access control (Admin/User)  
✅ Course management  
✅ Appointment booking  
✅ Product management  
✅ Blog/Articles with comments  
✅ Video management  
✅ Services management  
✅ Contact form  
✅ Newsletter subscription  
✅ Updates/Announcements  

## 🔐 Default Admin Credentials

```
Email: admin@shariqahmedtariqi.com
Password: Azeen@29336
```

⚠️ **Change these after first login!**

## 📁 Project Structure

```
backend/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── middleware/       # Auth & error handlers
├── models/          # Mongoose schemas
├── routes/          # API routes
├── scripts/         # Utility scripts
└── server.js        # Entry point
```

## 🌐 API Endpoints

### Public Routes
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/courses` - Get courses
- `GET /api/products` - Get products
- `POST /api/appointments` - Book appointment
- `POST /api/contact` - Send message
- `POST /api/newsletter/subscribe` - Subscribe

### Protected Routes (Admin)
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/appointments` - View appointments
- And many more...

## 🔧 Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with sample data
```

## 📝 Environment Variables

See `.env.example` for all required variables.

Key variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

## 🤝 Contributing

This is a private project for Sahibzada Shariq Ahmed Tariqi.

## 📄 License

Private & Confidential
