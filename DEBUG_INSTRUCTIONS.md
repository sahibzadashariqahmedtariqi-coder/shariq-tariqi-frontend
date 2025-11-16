# 🔍 Debug Instructions - Image Not Showing

## Step 1: Open Browser Console (F12)
1. Browser mein jao: `http://localhost:3000/admin/courses`
2. Press `F12` key
3. Console tab par click karo
4. Error messages check karo (red color mein)

## Step 2: Clear Browser Cache & localStorage
```javascript
// Console mein paste karo aur Enter press karo:
localStorage.clear()
location.reload()
```

## Step 3: Check Image Paths
Browser console mein paste karo:
```javascript
// Check what's in localStorage
console.log(JSON.parse(localStorage.getItem('courses-storage')))
```

## Step 4: Hard Refresh
Press: `Ctrl + Shift + R` (Windows)

## Step 5: Check Image URL
Console mein:
```javascript
// Check if image exists
fetch('/images/Jabl-E-Amliyat-Season-1.jpg')
  .then(r => console.log('Image Status:', r.status))
  .catch(e => console.error('Image Error:', e))
```

## Quick Fix Commands:

### Option A: Reset Everything
```javascript
localStorage.removeItem('courses-storage')
window.location.reload()
```

### Option B: Check All Images
```javascript
[
  '/images/tarbiyat-course.jpg',
  '/images/jabl-amliyat.jpg', 
  '/images/Jabl-E-Amliyat-Season-1.jpg',
  '/images/hikmat-tariqi.jpg',
  '/images/free-amliyat.jpg'
].forEach(path => {
  fetch(path)
    .then(r => console.log(path, '→', r.status === 200 ? '✅ OK' : '❌ FAIL'))
    .catch(e => console.log(path, '→ ❌ ERROR'))
})
```
