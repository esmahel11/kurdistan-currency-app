const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('.'));

// نرخەکانی سەرەتایی (دەتوانیت بە دەستی نوێیان بکەیتەوە)
let currentPrices = {
    timestamp: new Date().toISOString(),
    currency: {
        usd_buy: 154400,
        usd_sell: 154550,
        eur_buy: 177000,
        eur_sell: 179000,
        gbp_buy: 202000,
        gbp_sell: 205000,
        irr_buy: 1100,
        irr_sell: 1340,
        try_buy: 4475,
        try_sell: 4400,
        sar_buy: 39590,
        sar_sell: 41200,
        aed_buy: 40100,
        aed_sell: 42100,
        jod_buy: 208600,
        jod_sell: 223700
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

// خوێندنەوەی نرخەکان لە فایل (ئەگەر هەبێت)
try {
    const data = fs.readFileSync('current-prices.json', 'utf8');
    const fileData = JSON.parse(data);
    if (fileData.currency && fileData.gold) {
        currentPrices = fileData;
    }
} catch (error) {
    console.log('Using default prices');
}

// API endpoint بۆ وەرگرتنی نرخەکان
app.get('/api/prices', (req, res) => {
    res.json(currentPrices);
});

// API endpoint بۆ نوێکردنەوە (تەنها نرخەکانی ئێستا دەگەڕێنێتەوە)
app.get('/api/refresh', (req, res) => {
    // نوێکردنەوەی timestamp
    currentPrices.timestamp = new Date().toISOString();
    res.json(currentPrices);
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ سێرڤەر کاردەکات لەسەر پۆرتی ${PORT}`);
    console.log(`🌐 بڕۆ بۆ: http://localhost:${PORT}`);
});
