import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    page.on('console', msg => console.log('LOG:', msg.text()));

    console.log('Navigating...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'debug_screenshot.png' });

    const hero = await page.$eval('.hero-content', el => {
        const style = window.getComputedStyle(el);
        return {
            top: el.getBoundingClientRect().top,
            opacity: style.opacity,
            display: style.display,
            visibility: style.visibility,
            color: style.color
        };
    }).catch(e => e.message);

    console.log('HERO:', hero);

    const heroText = await page.$eval('.hero-title', el => ({
        text: el.textContent,
        opacity: window.getComputedStyle(el).opacity,
        display: window.getComputedStyle(el).display,
    })).catch(e => e.message);

    console.log('HERO TITLE:', heroText);

    await browser.close();
})();
