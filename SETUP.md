# 🚀 Quick Setup Guide

Follow these steps to get the Dr Abdul Wajid Shazli website running on your local machine.

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages (~500MB). It may take 5-10 minutes depending on your internet connection.

## Step 2: Verify Installation

After installation completes, verify everything is installed:

```powershell
npm list --depth=0
```

You should see all the packages listed in package.json.

## Step 3: Start Development Server

Start the development server:

```powershell
npm run dev
```

The application will automatically open in your browser at: `http://localhost:3000`

## Step 4: Explore the Application

You should now see:
- ✅ Homepage with hero section
- ✅ Prayer times widget
- ✅ Featured courses
- ✅ Latest videos
- ✅ Navigation header
- ✅ Footer with links

## Common Issues & Solutions

### Issue: "Cannot find module" errors

**Solution**: Make sure all dependencies are installed:
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Issue: Port 3000 already in use

**Solution**: Use a different port:
```powershell
npm run dev -- --port 3001
```

### Issue: Slow performance

**Solution**: 
1. Close unnecessary applications
2. Clear browser cache
3. Disable browser extensions

## Building for Production

When ready to deploy:

```powershell
npm run build
```

This creates an optimized build in the `dist` folder.

Preview the production build:

```powershell
npm run preview
```

## Project Features

✨ **Homepage**: Hero, prayer times, courses, videos, testimonials, newsletter  
📚 **Courses**: Browse and search spiritual courses  
💊 **Services**: TAQ healing, Istikhara, Hikmat services  
🎥 **Media**: Video lectures from YouTube  
🕌 **Prayer Times**: Live prayer times widget  
📝 **Blog**: Spiritual articles and guidance  
👤 **Authentication**: Login/Register system  
🌙 **Dark Mode**: Toggle between light and dark themes  
🌍 **Multi-language**: English, Urdu, Arabic support

## Next Steps

1. **Customize API**: Update `.env` file with your API URL
2. **Add Content**: Replace placeholder content with real data
3. **Test**: Test all features and pages
4. **Deploy**: Deploy to Vercel, Netlify, or your hosting provider

## Need Help?

- Check the main README.md for detailed documentation
- Review code comments in source files
- Contact: info@drabdulwajidshazli.com

---

Happy Coding! 🎉
