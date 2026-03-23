# ڕێنمایی هۆستکردن (Deployment Guide)

## چارەسەرە جیاوازەکان

### ١. GitHub Pages (ستاتیک - بێ سێرڤەر)

#### باشترین بۆ:
- نیشاندانی دیمۆ
- بەکارهێنانی کەسی
- نرخە دەستکردەکان

#### هەنگاوەکان:

1. **دروستکردنی Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[username]/[repo].git
git push -u origin main
```

2. **چالاککردنی GitHub Pages**
- بڕۆ بۆ Settings > Pages
- لە Source هەڵبژێرە: `main` branch
- پاشان کرتە لەسەر Save

3. **دەستگەیشتن**
```
https://[username].github.io/[repo]/
```

#### سنووردارییەکان:
- ❌ سێرڤەری Node.js کار ناکات
- ❌ سکراپینگی ئۆتۆماتیک نییە
- ✅ تەنها فایلە ستاتیکەکان کاردەکەن
- ✅ نرخەکان بە دەستی نوێ دەکرێنەوە

---

### ٢. Vercel (بە سێرڤەر - پێشنیارکراو)

#### باشترین بۆ:
- سکراپینگی ئۆتۆماتیک
- API endpoints
- بەکارهێنانی ڕاستەقینە

#### هەنگاوەکان:

1. **دامەزراندنی Vercel CLI**
```bash
npm install -g vercel
```

2. **دروستکردنی vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

3. **Deploy**
```bash
vercel
```

4. **دەستگەیشتن**
```
https://[project-name].vercel.app
```

#### تایبەتمەندییەکان:
- ✅ سێرڤەری Node.js کاردەکات
- ✅ سکراپینگی ئۆتۆماتیک
- ✅ API endpoints
- ✅ بێبەرامبەر بۆ پرۆژەی بچووک

---

### ٣. Netlify (بە Functions)

#### هەنگاوەکان:

1. **دامەزراندنی Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **دروستکردنی netlify.toml**
```toml
[build]
  functions = "functions"
  publish = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

3. **گواستنەوەی server.js بۆ functions/**
```bash
mkdir functions
# گۆڕینی server.js بۆ Netlify Functions format
```

4. **Deploy**
```bash
netlify deploy --prod
```

---

### ٤. Heroku (سێرڤەری تەواو)

#### هەنگاوەکان:

1. **دامەزراندنی Heroku CLI**
```bash
# لە heroku.com دایبگرە
```

2. **دروستکردنی Procfile**
```
web: node server.js
```

3. **Deploy**
```bash
heroku login
heroku create [app-name]
git push heroku main
```

4. **دەستگەیشتن**
```
https://[app-name].herokuapp.com
```

#### تێبینی:
- ⚠️ Heroku ئێستا بەرامبەرە (نەبێت بۆ پرۆژەی بچووک)

---

### ٥. Railway (نوێ و ئاسان)

#### هەنگاوەکان:

1. **بڕۆ بۆ railway.app**
2. کرتە لەسەر "New Project"
3. هەڵبژێرە "Deploy from GitHub repo"
4. Repository ەکەت هەڵبژێرە
5. Railway ئۆتۆماتیک دەیناسێتەوە و deploy دەکات

#### تایبەتمەندییەکان:
- ✅ زۆر ئاسانە
- ✅ بێبەرامبەر بۆ دەستپێک
- ✅ ئۆتۆماتیک deploy
- ✅ پشتگیری Node.js

---

### ٦. Render (بەرامبەر بە Heroku)

#### هەنگاوەکان:

1. **بڕۆ بۆ render.com**
2. کرتە لەسەر "New +"
3. هەڵبژێرە "Web Service"
4. Repository ەکەت بەستەرەوە
5. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`

---

## پێشنیارەکانم

### بۆ تاقیکردنەوە و دیمۆ:
**GitHub Pages** ✅
- بێبەرامبەر
- ئاسان
- خێرا

### بۆ بەکارهێنانی ڕاستەقینە:
**Vercel** ✅ یان **Railway** ✅
- سێرڤەری Node.js
- سکراپینگی ئۆتۆماتیک
- بێبەرامبەر/هەرزان
- ئاسانی deploy

---

## ئامادەکردنی پرۆژە بۆ Deploy

### ١. پاککردنەوە

```bash
# لابردنی فایلە پێویست نەبووەکان
rm -rf node_modules
rm package-lock.json
```

### ٢. نوێکردنەوەی package.json

```json
{
  "name": "kurdistan-currency-app",
  "version": "1.0.0",
  "description": "سیستەمی نرخی دراو و زێڕ بۆ کوردستان",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "scrape": "node rudaw-scraper.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### ٣. دروستکردنی .gitignore

```
node_modules/
.env
.DS_Store
*.log
```

### ٤. Commit و Push

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## تاقیکردنەوە

### لە ناوخۆیی:
```bash
npm install
npm start
# بڕۆ بۆ http://localhost:3000
```

### لە Production:
```bash
# بەپێی پلاتفۆرمەکە
```

---

## کێشە باوەکان

### کێشە: Port نادیارە
**چارەسەر**: لە server.js:
```javascript
const PORT = process.env.PORT || 3000;
```

### کێشە: Puppeteer کار ناکات
**چارەسەر**: زیادکردنی بۆ package.json:
```json
{
  "dependencies": {
    "puppeteer": "^21.0.0"
  }
}
```

### کێشە: CORS errors
**چارەسەر**: لە server.js:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
```

---

## پشتگیری

بۆ هەر پرسیار یان کێشەیەک:
1. سەیری [README.md](README.md) بکە
2. سەیری Issues لە GitHub بکە
3. Issue ی نوێ بکەرەوە

---

**چاکە deploy کردن! 🚀**

دروستکراوە بە ❤️ بۆ بەکارهێنەرانی کوردستان
