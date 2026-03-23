// سێرڤەری Node.js بۆ سکراپینگی ئۆتۆماتیک
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// فعالکردنی CORS
app.use(cors());
app.use(express.static('.'));

// داتای نرخەکان
let currentPrices = {
    timestamp: new Date().toISOString(),
    currency: {},
    gold: {},
    status: 'initializing'
};

// فانکشنی سکراپینگ
async function scrapeRudawIndex() {
    console.log('🚀 دەستپێکردنی سکراپینگ...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://rudawindex.net', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await page.waitForTimeout(5000);
        
        // کلیککردن لەسەر "کانزاکان (کوردستان)"
        console.log('🔘 کلیککردن لەسەر کانزاکان...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, [role=button], a'));
            const kurdistanBtn = buttons.find(btn => btn.textContent.includes('کانزاکان (کوردستان)'));
            if (kurdistanBtn) kurdistanBtn.click();
        });
        await page.waitForTimeout(3000);
        
        // وەرگرتنی نرخەکانی زێڕ
        const goldData = await page.evaluate(() => {
            const result = { gold: {} };
            
            function cleanNumber(text) {
                if (!text) return null;
                const cleaned = text.replace(/[,،]/g, '').replace(/[^\d.]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            }
            
            const bodyText = document.body.innerText;
            
            const goldPatterns = {
                // نرخی فەرمی سەندیکای زێڕنگران
                gold18_official: /نرخی\s*فەرمی.*?عەیار\s*18\s*([0-9,،]+)\s*دینار/gis,
                gold21_official: /نرخی\s*فەرمی.*?عەیار\s*21\s*([0-9,،]+)\s*دینار/gis,
                gold22_official: /نرخی\s*فەرمی.*?عەیار\s*22\s*([0-9,،]+)\s*دینار/gis,
                
                // کڕینەوەی زێڕ (بۆ هاووڵاتی)
                gold18_buy: /کڕینەوەی\s*زێڕ.*?عەیار\s*18\s*([0-9,،]+)\s*دینار/gis,
                gold21_buy: /کڕینەوەی\s*زێڕ.*?عەیار\s*21\s*([0-9,،]+)\s*دینار/gis,
                gold22_buy: /کڕینەوەی\s*زێڕ.*?عەیار\s*22\s*([0-9,،]+)\s*دینار/gis,
                
                // لیرەی زێڕ
                lira21: /لیرەی\s*زێڕ.*?عەیار\s*21\s*([0-9,،]+)\s*دینار/gis,
                lira22: /لیرەی\s*زێڕ.*?عەیار\s*22\s*([0-9,،]+)\s*دینار/gis,
                
                // کیلۆی زێڕ ٩٩٥
                kilo_gold_sell: /کیلۆی\s*زێڕ\s*995.*?فرۆشتن\s*([0-9,،]+)\s*دۆلار/gis,
                kilo_gold_buy: /کیلۆی\s*زێڕ\s*995.*?کڕین\s*([0-9,،]+)\s*دۆلار/gis,
                
                // کیلۆی زیو ٩٩٩٩
                kilo_silver_sell: /کیلۆی\s*زیو\s*9999.*?فرۆشتن\s*([0-9,،]+)\s*دۆلار/gis,
                kilo_silver_buy: /کیلۆی\s*زیو\s*9999.*?کڕین\s*([0-9,،]+)\s*دۆلار/gis,
                
                // پاتێرنی ساکار بۆ دۆزینەوەی هەر نرخێک
                gold18: /عەیار\s*18\s*([0-9,،]+)\s*دینار/gi,
                gold21: /عەیار\s*21\s*([0-9,،]+)\s*دینار/gi,
                gold22: /عەیار\s*22\s*([0-9,،]+)\s*دینار/gi
            };
            
            for (const [key, pattern] of Object.entries(goldPatterns)) {
                const matches = [...bodyText.matchAll(pattern)];
                if (matches.length > 0) {
                    const num = cleanNumber(matches[0][1]);
                    if (num) result.gold[key] = num;
                }
            }
            
            return result;
        });
        
        console.log('✅ نرخەکانی زێڕ:', goldData);
        
        // کلیککردن لەسەر "دراوەکان"
        console.log('🔘 کلیککردن لەسەر دراوەکان...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, [role=button], a'));
            const currencyBtn = buttons.find(btn => btn.textContent.includes('دراوەکان') && !btn.textContent.includes('کانزا'));
            if (currencyBtn) currencyBtn.click();
        });
        await page.waitForTimeout(3000);
        
        // گرتنی screenshot بۆ بینینی ستراکچەری پەڕەکە
        await page.screenshot({ path: 'currency-tab-screenshot.png', fullPage: true });
        console.log('📸 Screenshot گیرا');
        
        // وەرگرتنی هەموو تێکستی پەڕەکە بۆ دۆزینەوەی پاتێرنەکان
        const pageText = await page.evaluate(() => document.body.innerText);
        console.log('📄 نموونەیەک لە تێکستی پەڕەکە:');
        console.log(pageText.substring(0, 2000));
        
        // وەرگرتنی نرخەکانی دراو
        const currencyData = await page.evaluate(() => {
            const result = { currency: {} };
            
            function cleanNumber(text) {
                if (!text) return null;
                const cleaned = text.replace(/[,،]/g, '').replace(/[^\d.]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            }
            
            const bodyText = document.body.innerText;
            
            // هەموو دراوەکان - نرخی کڕین و فرۆشتن
            const currencyPatterns = {
                // دۆلار (بە دینار) - کڕین و فرۆشتن لە لاینی جیاوازن
                usd_buy: /دۆلار[\s\S]*?کڕین\s+([0-9,،]+)\s+دینار/gi,
                usd_sell: /دۆلار[\s\S]*?فرۆشتن\s+([0-9,،]+)\s+دینار/gi,
                
                // یۆرۆپی (بە دۆلار)
                eur_buy: /یۆرۆ[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
                eur_sell: /یۆرۆ[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
                gbp_buy: /پاوەند[\s\S]*?کڕین\s+([0-9,،.]+)\s+دۆلار/gi,
                gbp_sell: /پاوەند[\s\S]*?فرۆشتن\s+([0-9,،.]+)\s+دۆلار/gi,
                
                // ناوچەی ناوەڕاست
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
                
                // دراوەکانی تر
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
                    if (num) result.currency[key] = num;
                }
            }
            
            return result;
        });
        
        console.log('✅ نرخەکانی دراو:', currencyData);
        
        // نوێکردنەوەی داتا
        currentPrices = {
            timestamp: new Date().toISOString(),
            currency: currencyData.currency,
            gold: goldData.gold,
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
    } finally {
        if (browser) {
            await browser.close();
        }
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
    
    // سکراپینگی یەکەم جار
    await scrapeRudawIndex();
    
    // سکراپینگی ئۆتۆماتیک هەر ٣٠ خولەک
    setInterval(async () => {
        console.log('\n⏰ کاتی نوێکردنەوەی ئۆتۆماتیک...');
        await scrapeRudawIndex();
    }, 30 * 60 * 1000); // ٣٠ خولەک
});
