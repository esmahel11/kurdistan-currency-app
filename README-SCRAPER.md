# سکراپەری Rudaw Index

## چۆنیەتی دامەزراندن

```bash
npm install
```

## چۆنیەتی بەکارهێنان

```bash
npm run scrape
```

## ئەنجام

سکراپەرەکە ئەم فایلانە دروست دەکات:
- `rudaw-data.json` - داتای وەرگیراو بە فۆرماتی JSON
- `rudaw-screenshot.png` - وێنەی پەڕەکە بۆ پشکنین

## هەنگاوەکانی داهاتوو

1. فایلی `rudaw-screenshot.png` بکەرەوە و ستراکچەری پەڕەکە ببینە
2. فایلی `rudaw-data.json` بکەرەوە و کلاسەکان و تێکستەکان بپشکنە
3. لە `rudaw-scraper.js` سێلێکتەرەکان ڕاست بکەرەوە بەپێی ستراکچەری ڕاستەقینە
4. دووبارە `npm run scrape` بکە بۆ تاقیکردنەوە

## نموونەی سێلێکتەرەکان

```javascript
// نموونە: ئەگەر نرخی دۆلار لە <div class="rate-usd">1500</div> بێت
const usdRate = document.querySelector('.rate-usd').textContent;

// نموونە: ئەگەر نرخی زێڕ لە <span data-gold="21">395000</span> بێت
const gold21 = document.querySelector('[data-gold="21"]').textContent;
```

## یەکخستن لەگەڵ وێب ئەپەکە

دوای وەرگرتنی نرخە ڕاستەقینەکان، دەتوانیت:

1. API ی Node.js دروست بکەیت کە داتاکە بخاتە بەردەست
2. یان داتاکە بخەیتە ناو فایلی JSON و لە HTML وەریبگریت
3. یان بەکارهێنانی WebSocket بۆ نوێکردنەوەی زیندوو

## تێبینی

- سایتی Rudaw Index ڕێگەپێدانی robots.txt پشکنین بکە
- زۆر داواکاری مەکە (هەر ٥ خولەک یەکجار باشە)
- User-Agent ی گونجاو بەکاربهێنە
