# Sahibzada Shariq Ahmed Tariqi Website - Frontend Application

A modern, responsive frontend application built with React 18+, TypeScript, and Vite for Sahibzada Shariq Ahmed Tariqi's spiritual healing and guidance website.

## 🌟 Features

- **Modern Stack**: React 18, TypeScript, Vite
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Zustand for global state
- **Data Fetching**: React Query (TanStack Query) with caching
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions
- **UI Components**: Shadcn/ui component library
- **Routing**: React Router v6
- **SEO**: React Helmet Async for meta tags
- **i18n**: Multi-language support (English, Urdu, Arabic)
- **Dark Mode**: Theme switching capability
- **Islamic Design**: Traditional Islamic patterns and calligraphy

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── home/           # Homepage sections
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/             # UI components (Button, etc.)
├── pages/              # Page components
├── services/           # API services
├── stores/             # Zustand stores
├── types/              # TypeScript types
├── lib/                # Utility functions
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
VITE_API_BASE_URL=https://www.drabdulwajidshazli.com/api
```

3. Start development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## 🎨 Design System

### Colors

- **Primary**: Deep Green (#1B4332) - Traditional Islamic color
- **Secondary**: Gold (#D4AF37) - Accent color
- **Background**: White/Dark based on theme

### Typography

- **Primary Font**: System fonts for performance
- **Arabic Font**: Amiri
- **Urdu Font**: Noto Nastaliq Urdu

## 🌐 Pages

1. **Homepage** - Hero, courses, videos, testimonials, newsletter
2. **About** - Dr. Shazli's biography and mission
3. **Courses** - Course listing with filters
4. **Services** - Spiritual healing services
5. **Media Library** - Video lectures and audio content
6. **Prayer Times** - Dynamic prayer times calculator
7. **Blog** - Spiritual articles and guidance
8. **Contact** - Contact form and information
9. **Dashboard** - User dashboard (authenticated)

## 🔐 Authentication

The application includes a complete authentication system:

- Login/Register pages
- JWT token management
- Protected routes
- User dashboard

## 📱 Responsive Design

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## ♿ Accessibility

- WCAG 2.1 compliant
- Keyboard navigation
- Screen reader support
- High contrast mode

## 🌍 Multi-language Support

- English (default)
- Urdu (اردو)
- Arabic (العربية)
- RTL support for Arabic/Urdu

## 🎯 Performance Optimizations

- Code splitting
- Lazy loading
- Image optimization
- React Query caching
- Memoization

## 🔧 Tech Stack

- **React 18.3+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Zustand** - State management
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📦 Key Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.22.0",
  "@tanstack/react-query": "^5.22.0",
  "zustand": "^4.5.0",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.4",
  "framer-motion": "^11.0.5",
  "tailwindcss": "^3.4.1"
}
```

## 🚀 Deployment

Build for production:

```bash
npm run build
```

The `dist` folder will contain the optimized production build.

### Deployment Options

- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag and drop `dist` folder
- **AWS S3**: Upload to S3 bucket with CloudFront CDN
- **Traditional Hosting**: Upload `dist` contents to web server

## 🔒 Environment Variables

```
VITE_API_BASE_URL=https://your-api-url.com/api
```

## 🤝 Contributing

This is a private project for Dr Abdul Wajid Shazli's website.

## 📄 License

© 2024 Dr Abdul Wajid Shazli - Shazli Ruhani Darsgah. All rights reserved.

## 📞 Support

For support, email info@drabdulwajidshazli.com

---

Built with ❤️ for spreading spiritual knowledge
