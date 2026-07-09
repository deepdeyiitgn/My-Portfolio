import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');

const routes = [
    '/', '/about', '/me', '/contact', '/faq', '/feature', 
    '/portfolio', '/links', '/proof', '/journal', '/now', 
    '/legal', '/terms', '/privacy', '/dmca', '/copyright', 
    '/live', '/search', '/status', '/user', '/feedback',
    '/projects', '/projects/transparent-clock', '/projects/quicklink', '/projects/studybot', '/projects/personal-portfolio', '/projects/qlynk-node-server',
    '/user/owner', '/user/108378384135281109285', '/user/103350525420119609015', '/user/108546736464141807623',
    '/journal/view/6a3b728fea40f18e35fe537e', '/journal/view/6a364487e7d3429ef5437377', '/journal/view/6a1afdbaef3f827e6e5726d7', '/journal/view/6a0ef24159d82f5693e1ad60', '/journal/view/6a06c878d94656fbf2914c27', '/journal/view/6a001e7cfab7dafa47fe8daa', '/journal/view/69f5d1462a36a7dff2cbeca8', '/journal/view/69f7747757e35596332311d1', '/journal/view/69f1e775d3a5c766762ccae4', '/journal/view/69ef331a5298467d02a43969', '/journal/view/69eb999218b9adae7a75dbee', '/journal/view/69e8d2a2acfbc8a63a18bec6'
];

async function run() {
    console.log('🚀 Starting Pre-render with Bot Protection Bypass...');
    const app = express();

    const spoofedHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://deepdey.vercel.app/',
        'Origin': 'https://deepdey.vercel.app'
    };

    app.use('/api', createProxyMiddleware({
        target: 'https://deepdey.vercel.app', 
        changeOrigin: true,
        secure: true,
        headers: spoofedHeaders
    }));

    app.use(express.static(distPath));

    app.use((req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    const server = app.listen(3000);
    const browser = await puppeteer.launch({ headless: "new" });

    for (const route of routes) {
        console.log(`⏳ Rendering: ${route}`);
        try {
            const page = await browser.newPage();
            await page.setUserAgent(spoofedHeaders['User-Agent']);
            await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle2', timeout: 45000 });
            await new Promise(resolve => setTimeout(resolve, 2000));
            const html = await page.content();
            
            let filePath = path.join(distPath, route);
            if (!filePath.endsWith('.html')) filePath = path.join(filePath, 'index.html');
            
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, html);
            await page.close();
            console.log(`✅ Success: ${route}`);
        } catch (error) {
            console.error(`❌ Failed to render ${route}:`, error.message);
        }
    }

    await browser.close();
    server.close();
    console.log('✅ Pre-rendering Complete!');
}
run();