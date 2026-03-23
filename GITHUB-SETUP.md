# هەنگاوەکانی دانانی GitHub

## ١. دروستکردنی Repository لە GitHub

1. بڕۆ بۆ: https://github.com/new
2. ناوی repository: `kurdistan-currency-app` (یان هەر ناوێکی تر)
3. وەسف: `سیستەمی نرخی دراو و زێڕ بۆ کوردستان`
4. هەڵبژێرە: **Public** (بۆ GitHub Pages)
5. **مەکە**: Initialize with README (چونکە ئێمە هەمانە)
6. کرتە لەسەر: **Create repository**

## ٢. بەستنەوەی Repository ی ناوخۆیی بە GitHub

لە تێرمیناڵ، ئەم فەرمانانە بنووسە:

```bash
# بەستنەوەی remote (ناوی username و repo بگۆڕە)
git remote add origin https://github.com/[YOUR-USERNAME]/[REPO-NAME].git

# گۆڕینی branch بۆ main
git branch -M main

# Push کردن بۆ GitHub
git push -u origin main
```

## ٣. چالاککردنی GitHub Pages

1. لە repository ەکەت، بڕۆ بۆ: **Settings**
2. لە لای چەپ، کرتە لەسەر: **Pages**
3. لە بەشی **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
4. کرتە لەسەر: **Save**
5. چاوەڕوانی ١-٢ خولەک بکە

## ٤. دەستگەیشتن بە وێبسایتەکەت

پاش چەند خولەکێک، وێبسایتەکەت لێرە دەبێت:

```
https://[YOUR-USERNAME].github.io/[REPO-NAME]/
```

## ٥. تاقیکردنەوە

1. بڕۆ بۆ URL ەکە
2. دەبینیت لاپەڕەی سەرەکی (index.html)
3. کرتە لەسەر "دەستپێکردن" بۆ بینینی ئەپەکە

## تێبینییەکان

### بۆ GitHub Pages (ستاتیک):
- ✅ تەنها فایلە ستاتیکەکان کاردەکەن
- ❌ سێرڤەری Node.js کار ناکات
- ❌ سکراپینگی ئۆتۆماتیک نییە
- ✅ نرخەکان بە دەستی نوێ دەکرێنەوە

### بۆ بەکارهێنانی تەواو (بە سێرڤەر):
سەیری [DEPLOYMENT.md](DEPLOYMENT.md) بکە بۆ چارەسەرەکانی تر:
- Vercel (پێشنیارکراو)
- Railway
- Render
- Netlify

## چاککردنەکانی داهاتوو

کاتێک گۆڕانکاری دەکەیت:

```bash
git add .
git commit -m "وەسفی گۆڕانکارییەکە"
git push origin main
```

GitHub Pages ئۆتۆماتیک نوێ دەبێتەوە پاش چەند خولەکێک.

## کێشە باوەکان

### کێشە: 404 Not Found
**چارەسەر**: 
- دڵنیابە GitHub Pages چالاککراوە
- چاوەڕوانی ٥-١٠ خولەک بکە
- Cache ی بڕاوزەرەکە پاک بکەرەوە

### کێشە: نرخەکان نوێ نابنەوە
**چارەسەر**: 
- ئەمە ئاساییە لە GitHub Pages
- بۆ نوێکردنەوەی ئۆتۆماتیک، پێویستە سێرڤەر بەکاربهێنیت
- سەیری [DEPLOYMENT.md](DEPLOYMENT.md) بکە

### کێشە: دیزاین شکاوە
**چارەسەر**: 
- دڵنیابە هەموو فایلەکان push کراون
- چێککردنی console بۆ هەڵە
- Cache پاک بکەرەوە

## پشتگیری

ئەگەر کێشەیەکت هەبوو:
1. سەیری [README.md](README.md) بکە
2. Issue بکەرەوە لە GitHub

---

**چاکە deploy کردن! 🚀**
