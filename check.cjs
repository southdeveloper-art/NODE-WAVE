const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    const h1 = await page.$eval('.hero-title', el => el.textContent).catch(e => null);
    console.log('H1:', h1);

    await browser.close();
})();
