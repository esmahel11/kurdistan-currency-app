// سکراپەری Rudaw Index بە Puppeteer
// چۆنیەتی بەکارهێنان:
// 1. npm install puppeteer
// 2. node rudaw-scraper.js

const puppeteer = require('puppeteer');
const fs = require('fs');

// فانکشنی سکراپینگ
async function scrapeRudawIndex() {
    console.log('🚀 دەستپێکردنی سکراپینگ لە Rudaw Index...');
    
    let browser;
    try {
        // کردنەوەی وێبگەڕ
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // چوونە سەر سایتەکە
        console.log('📡 چوون بۆ https://rudawindex.net...');
        await page.goto('https://rudawindex.net', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('⏳ چاوەڕوانی بارکردنی JavaScript...');
        await page.waitForTimeout(5000);
        
        // کلیککردن لەسەر "کانزاکان (کوردستان)"
        console.log('🔘 کلیککردن لەسەر "کانزاکان (کوردستان)"...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, [role=button], a'));
            const kurdistanBtn = buttons.find(btn => btn.textContent.includes('کانزاکان (کوردستان)'));
            if (kurdistanBtn) kurdistanBtn.click();
        });
        await page.waitForTimeout(3000);
        
        // وەرگرتنی نرخەکانی زێڕ لە کوردستان
        const goldData = await page.evaluate(() => {
            const result = { gold: {}, debug: {} };
            
            function cleanNumber(text) {
                if (!text) return null;
                const cleaned = text.replace(/[,،]/g, '').replace(/[^\d.]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            }
            
            const bodyText = document.body.innerText;
            result.debug.goldSection = bodyText.substring(0, 1500);
            
            // دۆزینەوەی نرخەکانی زێڕ بە دینار
            const goldPatterns = {
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
            
            // دۆزینەوە بە DOM
            const allElements = document.querySelectorAll('*');
            const priceElements = [];
            allElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length < 100 && /(?:١٨|٢١|٢٢|18|21|22)[کk]/.test(text) && /\d{3,}/.test(text)) {
                    priceElements.push(text.substring(0, 80));
                }
            });
            result.debug.goldElements = priceElements.slice(0, 10);
            
            return result;
        });
        
        console.log('✅ نرخەکانی زێڕ:', goldData);
        
        // کلیککردن لەسەر "دراوەکان"
        console.log('🔘 کلیککردن لەسەر "دراوەکان"...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, [role=button], a'));
            const currencyBtn = buttons.find(btn => btn.textContent.includes('دراوەکان') && !btn.textContent.includes('کانزا'));
            if (currencyBtn) currencyBtn.click();
        });
        await page.waitForTimeout(3000);
        
        // وەرگرتنی نرخەکانی دراو
        const currencyData = await page.evaluate(() => {
            const result = { currency: {}, debug: {} };
            
            function cleanNumber(text) {
                if (!text) return null;
                const cleaned = text.replace(/[,،]/g, '').replace(/[^\d.]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            }
            
            const bodyText = document.body.innerText;
            result.debug.currencySection = bodyText.substring(0, 1500);
            
            // دۆزینەوەی نرخەکانی دراو بە دینار
            const currencyPatterns = {
                usd: /دۆلار\s*کڕین\s*([0-9,،]+)\s*دینار/gi,
                irr: /تمەنی?\s*(?:ئێرانی)?\s*کڕین\s*([0-9,،]+)\s*تومەن/gi,
                try: /لیرەی?\s*(?:تورکی)?\s*کڕین\s*([0-9,،]+)\s*لیرە/gi
            };
            
            for (const [key, pattern] of Object.entries(currencyPatterns)) {
                const matches = [...bodyText.matchAll(pattern)];
                if (matches.length > 0) {
                    const num = cleanNumber(matches[0][1]);
                    if (num) result.currency[key] = num;
                }
            }
            
            // دۆزینەوە بە DOM
            const allElements = document.querySelectorAll('*');
            const priceElements = [];
            allElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length < 100 && /(?:دۆلار|تمەن|لیرە)/.test(text) && /\d{3,}/.test(text)) {
                    priceElements.push(text.substring(0, 80));
                }
            });
            result.debug.currencyElements = priceElements.slice(0, 10);
            
            return result;
        });
        
        console.log('✅ نرخەکانی دراو:', currencyData);
        
        // یەکخستنی داتاکان
        const data = {
            timestamp: new Date().toISOString(),
            currency: currencyData.currency,
            gold: goldData.gold,
            debug: {
                goldSection: goldData.debug,
                currencySection: currencyData.debug
            }
        };
        
        console.log('✅ داتاکە وەرگیرا:', JSON.stringify(data, null, 2));
        
        // پاشەکەوتکردن لە فایل
        fs.writeFileSync('rudaw-data.json', JSON.stringify(data, null, 2));
        console.log('💾 داتاکە لە rudaw-data.json پاشەکەوت کرا');
        
        // وەرگرتنی سکرینشۆت بۆ پشکنین
        await page.screenshot({ path: 'rudaw-screenshot.png', fullPage: true });
        console.log('📸 سکرینشۆت گیرا: rudaw-screenshot.png');
        
        return data;
        
    } catch (error) {
        console.error('❌ هەڵە:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// فانکشنی سەرەکی
async function main() {
    try {
        const data = await scrapeRudawIndex();
        
        console.log('\n📊 ئەنجام:');
        console.log('════════════════════════════════════');
        console.log('تکایە فایلەکانی خوارەوە بپشکنە:');
        console.log('1. rudaw-data.json - داتای وەرگیراو');
        console.log('2. rudaw-screenshot.png - وێنەی پەڕەکە');
        console.log('\nدوای پشکنینی ستراکچەری HTML، سێلێکتەرەکان ڕاست بکەرەوە');
        console.log('════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ سکراپینگ شکستی هێنا:', error.message);
        process.exit(1);
    }
}

// جێبەجێکردن
if (require.main === module) {
    main();
}

module.exports = { scrapeRudawIndex };
