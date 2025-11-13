# YouTube API Setup Guide

## 🎥 Automatic Video Updates Configuration

Yeh guide aapko batayegi ke kaise YouTube API ko setup karen taake **Sahibzada Shariq Ahmed Tariqi** ki new videos automatically website par show hon.

---

## 📋 Steps to Get YouTube API Key

### 1. Google Cloud Console Setup

1. **Google Cloud Console** par jayen: https://console.cloud.google.com/
2. Naya project banayen ya existing project select karen
3. **APIs & Services** > **Library** par click karen
4. **"YouTube Data API v3"** search karen aur enable karen

### 2. API Key Generate Karen

1. **APIs & Services** > **Credentials** par jayen
2. **"+ CREATE CREDENTIALS"** par click karen
3. **"API Key"** select karen
4. API key copy kar len

### 3. API Key Ko Restrict Karen (Security)

1. API key ke paas **"Edit API key"** par click karen
2. **"API restrictions"** section mein:
   - **"Restrict key"** select karen
   - **"YouTube Data API v3"** ko select karen
3. **Save** karen

---

## ⚙️ Configuration Steps

### 1. `.env` File Update Karen

File: `.env`

```env
VITE_API_BASE_URL=https://www.shariqahmedtariqi.com/api
VITE_YOUTUBE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
VITE_YOUTUBE_CHANNEL_ID=UCxLqvT6PgXjKZ5_X7d_q7Ng
```

**Note:** 
- `YOUR_ACTUAL_API_KEY_HERE` ki jagah apni real API key lagayen
- Channel ID already correct hai (Sahibzada Shariq Ahmed Tariqi ka channel)

### 2. Development Server Restart Karen

```powershell
# Server ko stop karen (Ctrl + C)
# Phir dobara start karen
npm run dev
```

---

## 🔍 Channel ID Kaise Nikalen (Optional)

Agar aapko channel ID change karni ho:

1. YouTube channel par jayen: https://www.youtube.com/@Sahibzadashariqahmedtariqi
2. Page ka source code dekhen (Right-click > View Page Source)
3. Search karen: `"channelId"` ya `"externalId"`
4. Channel ID copy karen (Format: `UC...`)

**Current Channel ID:** `UCxLqvT6PgXjKZ5_X7d_q7Ng`

---

## ✨ Features

### Automatic Video Updates
- Har baar page load hone par latest 12 videos fetch hoti hain
- Videos chronological order mein (newest first)
- Real YouTube thumbnails aur titles

### Fallback System
- Agar API key configure nahi hai, toh hardcoded videos show hongi
- Agar API error aaye, toh bhi fallback videos chalegi
- Zero downtime guarantee

### Carousel Navigation
- Previous/Next arrow buttons
- Pagination dots
- 4 videos per page (total 3 pages)

---

## 🚀 How It Works

### 1. Component Level (`LatestVideos.tsx`)
```typescript
useEffect(() => {
  const fetchVideos = async () => {
    const response = await videosApi.getLatestFromYouTube()
    // Videos ko format karen aur state mein save karen
  }
  fetchVideos()
}, [])
```

### 2. API Service (`apiService.ts`)
```typescript
getLatestFromYouTube: async () => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`
  )
  return await response.json()
}
```

### 3. YouTube API Response
```json
{
  "items": [
    {
      "id": { "videoId": "L86pSu3ozTc" },
      "snippet": {
        "title": "Video Title",
        "description": "...",
        "thumbnails": { ... }
      }
    }
  ]
}
```

---

## 🔐 API Key Security

### ⚠️ Important Security Notes:

1. **Never commit `.env` file to Git** (already in `.gitignore`)
2. **API key ko restrict karen** (YouTube Data API v3 only)
3. **HTTP referrer restrictions lagayen** (production domain)
4. **Usage limits monitor karen** (free: 10,000 units/day)

### Production Deployment:

```bash
# Vercel
vercel env add VITE_YOUTUBE_API_KEY

# Netlify
netlify env:set VITE_YOUTUBE_API_KEY "your-key-here"
```

---

## 📊 API Quota Usage

### Free Tier Limits:
- **10,000 units per day**
- Each search request = **100 units**
- **100 searches per day** possible

### Optimization Tips:
1. Videos ko cache karen (localStorage/sessionStorage)
2. Refresh interval set karen (5-10 minutes)
3. Browser refresh par hi fetch karen (current setup)

---

## 🐛 Troubleshooting

### Problem: Videos nahi aa rahi
**Solution:**
1. Check karen `.env` file mein API key correct hai
2. Browser console check karen (F12 > Console)
3. API key enabled hai YouTube Data API v3 ke liye

### Problem: API quota exceed
**Solution:**
1. Caching implement karen
2. Fallback videos automatically show hongi
3. Next day quota reset ho jayega

### Problem: Console mein "API key not configured"
**Solution:**
1. `.env` file check karen
2. Server restart karen: `npm run dev`
3. Hard refresh karen: `Ctrl + Shift + R`

---

## 📝 Testing

### Without API Key (Fallback):
```
Console: "YouTube API key not configured"
Result: 12 hardcoded videos show hongi
```

### With API Key:
```
Console: No warnings
Result: Latest videos from YouTube channel
```

---

## 🎯 Summary

✅ **YouTube API setup complete**
✅ **Automatic video fetching enabled**
✅ **Fallback system working**
✅ **Carousel navigation added**
✅ **12 latest videos show hongi**
✅ **New videos automatically update**

**Next Step:** Google Cloud Console se API key le kar `.env` file mein add karen!

---

## 💡 Support

Agar koi problem ho toh console check karen (F12) ya error message share karen.

**Channel:** [@Sahibzadashariqahmedtariqi](https://www.youtube.com/@Sahibzadashariqahmedtariqi)

---

*Last Updated: November 12, 2025*
