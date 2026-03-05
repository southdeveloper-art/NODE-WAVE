const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport to a common desktop size
    await page.setViewport({ width: 1920, height: 1080 });

    // Catch console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log('Navigating to localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });

    // Take a full page screenshot
    await page.screenshot({ path: 'debug_screenshot.png', fullPage: true });

    // Get some bounding boxes to see if elements exist
    const heroContent = await page.$eval('.hero-content', el => {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        return {
            top: rect.top, height: rect.height, opacity: computedStyle.opacity, display: computedStyle.display, visibility: computedStyle.visibility
        };
    }).catch(() => null);

    console.log('Hero Content:', heroContent);

    const container = await page.$eval('.container', el => {
        const computedStyle = window.getComputedStyle(el);
        return { zIndex: computedStyle.zIndex, opacity: computedStyle.opacity };
    }).catch(() => null);

    console.log('Container Computed:', container);

    await browser.close();
})();
