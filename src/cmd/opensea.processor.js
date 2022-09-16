const puppeteer = require("puppeteer");
const {error} = require("../utils/utils");
const {db} = require("../db/db");

const url = process.argv[2];
const extractWebsite = (hrefs) => {
    const filtered = hrefs.filter(href =>
        !(href.includes('discord')
            || href.includes('twitter')
            || href.includes('medium')
            || href.includes('etherscan')
            || href.includes('reddit'))
    )

    return filtered.length > 0 ? filtered[0] : null
}

const processHrefs = hrefs => {
    const website = extractWebsite(hrefs)
    if (website) {
        process.send(website)
    }

    db.run("INSERT INTO meta_data(url, website) VALUES(?, ?) ON CONFLICT(url) DO UPDATE SET website=?", [url, website, website], (err) => {
        if (err) {
            return error(JSON.stringify(err), 'Error while inserting data')
        }
    })
}

(async () => {
    console.log('---OPENSEA PROCESSOR START PROCESSING:---', url)
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    })

    try {
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'load', timeout: 0 })
        const parentSelector = '.fresnel-container .fresnel-greaterThan-md > div'
        const parent = await page.$(parentSelector)
        const childrenHandler = await page.evaluateHandle(e => e.children, parent)
        const properties = await childrenHandler.getProperties();
        for (const property of properties.values()) {
            const element = property.asElement();
            const aTagSelector = 'div > a'
            const hrefs = await element.$$eval(aTagSelector, elements => elements.map(e => e.getAttribute('href')))
            processHrefs(hrefs)
        }
    } catch (err) {
        error(JSON.stringify(err), `WHILE PROCESSING - ${url}`)
    } finally {
        console.log('---OPENSEA END PROCESSING:---', url)
        process.exit()
        await browser.close()
    }
})()