# Backend API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All admin routes require Bearer token in headers:
```
Authorization: Bearer <your_jwt_token>
```

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "Ahmed Khan",
  "email": "ahmed@example.com",
  "password": "password123",
  "phone": "03001234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "name": "Ahmed Khan",
    "email": "ahmed@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User
**POST** `/auth/login`

**Body:**
```json
{
  "email": "admin@shariqahmedtariqi.com",
  "password": "Azeen@29336"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "Admin",
    "email": "admin@shariqahmedtariqi.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## Courses API

### Get All Courses
**GET** `/courses?category=spiritual&search=روحانی&page=1&limit=12`

**Query Parameters:**
- `category`: all, spiritual, roohani, jismani, nafsiati
- `search`: Search term
- `sort`: newest, oldest, popular, rating
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "...",
      "title": "جبل عملیات کورس",
      "description": "...",
      "image": "/images/jabl-amliyat-1.jpg",
      "category": "spiritual",
      "duration": "6 Weeks",
      "price": 5000,
      "isFeatured": true,
      "enrolledStudents": 120,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Create Course (Admin Only)
**POST** `/courses`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "title": "نیا کورس",
  "description": "کورس کی تفصیل",
  "shortDescription": "مختصر تفصیل",
  "image": "/images/course.jpg",
  "category": "spiritual",
  "duration": "4 Weeks",
  "level": "beginner",
  "price": 3000,
  "isPaid": true,
  "isFeatured": false
}
```

### Update Course (Admin Only)
**PUT** `/courses/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:** Same as create (partial update supported)

### Delete Course (Admin Only)
**DELETE** `/courses/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

## Appointments API

### Book Appointment
**POST** `/appointments`

**Body:**
```json
{
  "name": "Ahmed Khan",
  "email": "ahmed@example.com",
  "phone": "03001234567",
  "date": "2024-12-20",
  "time": "10:00 AM",
  "type": "spiritual-healing",
  "message": "Need spiritual healing session"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "...",
    "name": "Ahmed Khan",
    "status": "pending",
    "createdAt": "..."
  }
}
```

### Get All Appointments (Admin Only)
**GET** `/appointments?status=pending&date=2024-12-20`

**Headers:**
```
Authorization: Bearer <admin_token>
```

## Products API

### Get All Products
**GET** `/products?category=books&page=1`

### Create Product (Admin Only)
**POST** `/products`

**Body:**
```json
{
  "name": "روحانی کتاب",
  "description": "تفصیل",
  "shortDescription": "مختصر",
  "image": "/images/book.jpg",
  "category": "books",
  "price": 500,
  "stock": 50,
  "inStock": true,
  "isFeatured": true
}
```

## Contact API

### Send Contact Message
**POST** `/contact`

**Body:**
```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "phone": "03001234567",
  "subject": "Query about courses",
  "message": "I want to know more about spiritual courses"
}
```

## Newsletter API

### Subscribe
**POST** `/newsletter/subscribe`

**Body:**
```json
{
  "email": "subscriber@example.com",
  "name": "Ahmed"
}
```

### Unsubscribe
**POST** `/newsletter/unsubscribe`

**Body:**
```json
{
  "email": "subscriber@example.com"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 403: Forbidden (Admin only)
- 404: Not Found
- 500: Server Error

## Rate Limiting
- No rate limit in development
- Production: 100 requests per 15 minutes per IP

## CORS
Allowed origins configured in backend `.env`:
- Development: http://localhost:3000
- Production: Your domain
