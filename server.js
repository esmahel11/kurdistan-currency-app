// سێرڤەری Node.js بۆ سکراپینگی ئۆتۆماتیک
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// فعالکردنی CORS
app.use(cors());
app.use(express.static('.'));

// داتای نرخەکان - بارکردنی داتای پاشەکەوتکراو لە فایل (ئەگەر هەبوو)
let currentPrices = {
    timestamp: new Date().toISOString(),
    currency: {},
    gold: {},
    status: 'initializing'
};

try {
    if (fs.existsSync('current-prices.json')) {
        const saved = JSON.parse(fs.readFileSync('current-prices.json', 'utf8'));
        currentPrices = saved;
        console.log('📂 داتای پاشەکەوتکراو بارکرا');
    }
} catch (e) {
    console.warn('⚠️ نەتوانرا داتای پاشەکەوتکراو بباردرێت:', e.message);
}

// یارمەتیدەری پاککردنەوەی ژمارە
function cleanNumber(text) {
    if (!text) return null;
    const cleaned = text.replace(/[,،]/g, '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

// فانکشنی سکراپینگ بە HTTP fetch
async function scrapeRudawIndex() {
    console.log('🚀 دەستپێکردنی سکراپینگ...');

    try {
        const response = await fetch('https://rudawindex.net', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ku,ar;q=0.9,en;q=0.8'
            },
            timeout: 30000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const bodyText = await response.text();
        console.log('📄 پەڕەکە بارکرا، قەبارە:', bodyText.length, 'کاراکتەر');

        // وەرگرتنی نرخەکانی زێڕ
        const gold = {};
        const goldPatterns = {
            gold18_official: /نرخی\s*فەرمی.*?عەیار\s*18\s*([0-9,،]+)\s*دینار/gis,
            gold21_official: /نرخی\s*فەرمی.*?عەیار\s*21\s*([0-9,،]+)\s*دینار/gis,
            gold22_official: /نرخی\s*فەرمی.*?عەیار\s*22\s*([0-9,،]+)\s*دینار/gis,
            gold18_buy: /کڕینەوەی\s*زێڕ.*?عەیار\s*18\s*([0-9,،]+)\s*دینار/gis,
            gold21_buy: /کڕینەوەی\s*زێڕ.*?عەیار\s*21\s*([0-9,،]+)\s*دینار/gis,
            gold22_buy: /کڕینەوەی\s*زێڕ.*?عەیار\s*22\s*([0-9,،]+)\s*دینار/gis,
            lira21: /لیرەی\s*زێڕ.*?عەیار\s*21\s*([0-9,،]+)\s*دینار/gis,
            lira22: /لیرەی\s*زێڕ.*?عەیار\s*22\s*([0-9,،]+)\s*دینار/gis,
            kilo_gold_sell: /کیلۆی\s*زێڕ\s*995.*?فرۆشتن\s*([0-9,،]+)\s*دۆلار/gis,
            kilo_gold_buy: /کیلۆی\s*زێڕ\s*995.*?کڕین\s*([0-9,،]+)\s*دۆلار/gis,
            kilo_silver_sell: /کیلۆی\s*زیو\s*9999.*?فرۆشتن\s*([0-9,،]+)\s*دۆلار/gis,
            kilo_silver_buy: /کیلۆی\s*زیو\s*9999.*?کڕین\s*([0-9,،]+)\s*دۆلار/gis,
            gold18: /عەیار\s*18\s*([0-9,،]+)\s*دینار/gi,
            gold21: /عەیار\s*21\s*([0-9,،]+)\s*دینار/gi,
            gold22: /عەیار\s*22\s*([0-9,،]+)\s*دینار/gi
        };

        for (const [key, pattern] of Object.entries(goldPatterns)) {
            const matches = [...bodyText.matchAll(pattern)];
            if (matches.length > 0) {
                const num = cleanNumber(matches[0][1]);
                if (num) gold[key] = num;
            }
        }

        // وەرگرتنی نرخەکانی دراو
        const currency = {};
        const currencyPatterns = {
            usd_buy: /دۆلار[\s\S]*?کڕین\s+([0-9,،]+)\s+دینار/gi,
            usd_sell: /دۆلار[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+دینار/gi,
            eur_buy: /یۆرۆ[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            eur_sell: /یۆرۆ[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            gbp_buy: /پاوەند[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            gbp_sell: /پاوەند[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            irr_buy: /تمەنی?\s*(?:ئێرانی)?[\s\S]*?کڕین\s+([0-9,،]+)\s+تومەن/gi,
            irr_sell: /تمەنی?\s*(?:ئێرانی)?[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+تومەن/gi,
            try_buy: /لیرەی?\s*(?:تورکی)?[\s\S]*?کڕین\s+([0-9,،]+)\s+لیرە/gi,
            try_sell: /لیرەی?\s*(?:تورکی)?[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+لیرە/gi,
            sar_buy: /ڕیاڵی\s*سعوودی[\s\S]*?کڕین\s+([0-9,،]+)\s+ڕیاڵ/gi,
            sar_sell: /ڕیاڵی\s*سعوودی[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+ڕیاڵ/gi,
            aed_buy: /درهەمی\s*ئیماراتی[\s\S]*?کڕین\s+([0-9,،]+)\s+درهەم/gi,
            aed_sell: /درهەمی\s*ئیماراتی[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+درهەم/gi,
            jod_buy: /دیناری\s*ئوردنی[\s\S]*?کڕین\s+([0-9,،]+)\s+دینار/gi,
            jod_sell: /دیناری\s*ئوردنی[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+دینار/gi,
            cad_buy: /دۆلاری\s*کەنەدی[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            cad_sell: /دۆلاری\s*کەنەدی[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            chf_buy: /فرانکی\s*سویسری[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            chf_sell: /فرانکی\s*سویسری[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            sek_buy: /کرۆنی\s*سویدی[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            sek_sell: /کرۆنی\s*سویدی[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            nok_buy: /کرۆنی\s*نەرویژی[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            nok_sell: /کرۆنی\s*نەرویژی[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            dkk_buy: /کرۆنی\s*دانیمارکی[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            dkk_sell: /کرۆنی\s*دانیمارکی[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
            aud_buy: /دۆلاری\s*ئوستوڕاڵی[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
            aud_sell: /دۆلاری\s*ئوستوڕاڵی[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi
        };

        for (const [key, pattern] of Object.entries(currencyPatterns)) {
            const matches = [...bodyText.matchAll(pattern)];
            if (matches.length > 0) {
                const num = cleanNumber(matches[0][1]);
                if (num) currency[key] = num;
            }
        }

        console.log('✅ نرخەکانی زێڕ:', gold);
        console.log('✅ نرخەکانی دراو:', currency);

        // نوێکردنەوەی داتا
        currentPrices = {
            timestamp: new Date().toISOString(),
            currency,
            gold,
            status: 'success'
        };

        // پاشەکەوتکردن لە فایل
        fs.writeFileSync('current-prices.json', JSON.stringify(currentPrices, null, 2));
        console.log('💾 نرخەکان پاشەکەوت کران');

        return currentPrices;

    } catch (error) {
        console.error('❌ هەڵە:', error);
        currentPrices.status = 'error';
        currentPrices.error = error.message;
        return currentPrices;
    }
}

// API Endpoint بۆ وەرگرتنی نرخەکان
app.get('/api/prices', (req, res) => {
    res.json(currentPrices);
});

// API Endpoint بۆ نوێکردنەوەی دەستی
app.get('/api/refresh', async (req, res) => {
    console.log('🔄 داواکاری نوێکردنەوەی دەستی...');
    const prices = await scrapeRudawIndex();
    res.json(prices);
});

// سێرڤکردنی فایلی HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/currency-app.html');
});

// دەستپێکردنی سێرڤەر
app.listen(PORT, async () => {
    console.log(`🚀 سێرڤەر کارپێکرا لەسەر http://localhost:${PORT}`);
    console.log('📡 API: http://localhost:' + PORT + '/api/prices');
    console.log('🔄 نوێکردنەوە: http://localhost:' + PORT + '/api/refresh');

    // سکراپینگی یەکەم جار لە پاشەوە (ناگرێتەوە سێرڤەر)
    scrapeRudawIndex().catch(err => console.error('❌ سکراپینگی یەکەم جار شکستی هێنا:', err.message));

    // سکراپینگی ئۆتۆماتیک هەر ٣٠ خولەک
    setInterval(async () => {
        console.log('\n⏰ کاتی نوێکردنەوەی ئۆتۆماتیک...');
        await scrapeRudawIndex();
    }, 30 * 60 * 1000); // ٣٠ خولەک
});
