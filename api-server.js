const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('.'));

// وەرگرتنی نرخی دۆلار لە API ی ئامادە
async function fetchUSDRate() {
    return new Promise((resolve, reject) => {
        https.get('https://api.exchangerate-api.com/v4/latest/USD', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // نرخی دۆلار بەرامبەر دینار (IQD)
                    const usdToIqd = json.rates.IQD || 1310;
                    resolve(usdToIqd * 100); // بۆ ١٠٠ دۆلار
                } catch (e) {
                    resolve(154400); // نرخی سەرەتایی
                }
            });
        }).on('error', () => {
            resolve(154400); // نرخی سەرەتایی
        });
    });
}

// API endpoint بۆ وەرگرتنی نرخەکان
app.get('/api/prices', async (req, res) => {
    const usdRate = await fetchUSDRate();
    
    const prices = {
        timestamp: new Date().toISOString(),
        currency: {
            usd_buy: Math.round(usdRate * 0.995),
            usd_sell: Math.round(usdRate * 1.005),
            eur_buy: Math.round(usdRate * 1.15 * 0.995),
            eur_sell: Math.round(usdRate * 1.15 * 1.005),
            gbp_buy: Math.round(usdRate * 1.31 * 0.995),
            gbp_sell: Math.round(usdRate * 1.31 * 1.005),
            irr_buy: Math.round((usdRate / 42000) * 100000),
            irr_sell: Math.round((usdRate / 42000) * 100000 * 1.02),
            try_buy: Math.round((usdRate / 34) * 0.995),
            try_sell: Math.round((usdRate / 34) * 1.005),
            sar_buy: Math.round((usdRate / 3.75) * 0.995),
            sar_sell: Math.round((usdRate / 3.75) * 1.005),
            aed_buy: Math.round((usdRate / 3.67) * 0.995),
            aed_sell: Math.round((usdRate / 3.67) * 1.005),
            jod_buy: Math.round((usdRate / 0.71) * 0.995),
            jod_sell: Math.round((usdRate / 0.71) * 1.005)
        },
        gold: {
            gold18_official: 821057,
            gold21_official: 957899,
            gold22_official: 1003514,
            gold18_buy: 792198,
            gold21_buy: 930899,
            gold22_buy: 970131,
            lira21: 965899,
            lira22: 1387375
        },
        status: 'success'
    };
    
    res.json(prices);
});

// API endpoint بۆ نوێکردنەوە
app.get('/api/refresh', async (req, res) => {
    const usdRate = await fetchUSDRate();
    
    const prices = {
        timestamp: new Date().toISOString(),
        currency: {
            usd_buy: Math.round(usdRate * 0.995),
            usd_sell: Math.round(usdRate * 1.005),
            eur_buy: Math.round(usdRate * 1.15 * 0.995),
            eur_sell: Math.round(usdRate * 1.15 * 1.005),
            gbp_buy: Math.round(usdRate * 1.31 * 0.995),
            gbp_sell: Math.round(usdRate * 1.31 * 1.005),
            irr_buy: Math.round((usdRate / 42000) * 100000),
            irr_sell: Math.round((usdRate / 42000) * 100000 * 1.02),
            try_buy: Math.round((usdRate / 34) * 0.995),
            try_sell: Math.round((usdRate / 34) * 1.005),
            sar_buy: Math.round((usdRate / 3.75) * 0.995),
            sar_sell: Math.round((usdRate / 3.75) * 1.005),
            aed_buy: Math.round((usdRate / 3.67) * 0.995),
            aed_sell: Math.round((usdRate / 3.67) * 1.005),
            jod_buy: Math.round((usdRate / 0.71) * 0.995),
            jod_sell: Math.round((usdRate / 0.71) * 1.005)
        },
        gold: {
            gold18_official: 821057,
            gold21_official: 957899,
            gold22_official: 1003514,
            gold18_buy: 792198,
            gold21_buy: 930899,
            gold22_buy: 970131,
            lira21: 965899,
            lira22: 1387375
        },
        status: 'success'
    };
    
    res.json(prices);
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`✅ سێرڤەر کاردەکات لەسەر پۆرتی ${PORT}`);
});

