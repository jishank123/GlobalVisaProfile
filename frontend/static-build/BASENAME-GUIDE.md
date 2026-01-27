# Basename Router Deployment Guide

## ✅ What's New
- **Basename Support**: All routes automatically get /CRM prefix
- **Link Interception**: Regular links like href="/login" become /CRM/login
- **React Router Style**: Works like React Router's basename prop

## 🚀 How It Works

### Automatic Link Conversion
```html
<!-- You write: -->
<a href="/login">Login</a>

<!-- Router converts to: -->
<a href="/CRM/login">Login</a>
```

### JavaScript Navigation
```javascript
// Navigate by path
navigate('login');        // Goes to /CRM/login
navigate('assessment');   // Goes to /CRM/assessment

// Navigate by route key
navigateTo('login', 'public');     // Goes to /CRM/login
navigateTo('dashboard', 'protected'); // Goes to /CRM/client-profile

// Create URLs
createUrl('login');       // Returns "/CRM/login"
createUrl('services');    // Returns "/CRM/services"
```

### Data-Route Navigation
```html
<button data-route="login" data-route-type="public">Login</button>
<button data-route="profileAssessment" data-route-type="public">Assessment</button>
```

## 📁 Upload to OVH

1. **Upload these files to /CRM/ folder:**
   - .htaccess (routing rules)
   - public/ (CSS, JS files)
   - views/ (HTML pages)
   - test-basename.html (test the router)

2. **Test the basename:**
   - Visit: https://immigrationprofile.com/CRM/test-basename.html
   - Try clicking different navigation links
   - Check browser console for router logs

## 🔧 URLs That Work

- Homepage: https://immigrationprofile.com/CRM/
- Login: https://immigrationprofile.com/CRM/login
- Assessment: https://immigrationprofile.com/CRM/assessment
- Services: https://immigrationprofile.com/CRM/services
- Admin: https://immigrationprofile.com/CRM/admin

## 🎯 Key Features

1. **Automatic Basename**: All links get /CRM prefix automatically
2. **No Page Reloads**: Uses window.location.href for navigation
3. **Link Interception**: Catches all relative links and adds basename
4. **Global Helpers**: navigate(), navigateTo(), createUrl() functions
5. **Route Detection**: getCurrentRoute() shows current page without basename

## 📞 Testing

After upload, test these scenarios:
1. ✅ Direct URL access: /CRM/login
2. ✅ Link clicking: href="/login" → /CRM/login
3. ✅ JavaScript navigation: navigate('login')
4. ✅ Data-route buttons: data-route="login"
5. ✅ Browser back/forward buttons

Your basename router is ready! 🎉
