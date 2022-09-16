const {getActionWords} = require('../utils/utils');
const puppeteer = require("puppeteer");
const {updateHyperLinks, db} = require("../db/db");
const fs = require('fs');
const path = require("path");

const rootUrl = process.argv[4]
const url = process.argv[2];
const action_words = getActionWords(process.argv);

const contains = async (page, url) => {
    for (const word of action_words) {
        console.log(`----Evaluating ${word} at ${url}----`)
        const found = await page.evaluate(() => window.find(`claim`));

        if (found) {
            console.log('---Found a match---', {
                word,
                url,
            })
            const data = await page.evaluate(() => document.querySelector('*').outerHTML)
            const fileName = url.replace(/https?:\/\//g, '').replace(/\//g, '-')
            fs.writeFile(path.resolve(__dirname, '../../', 'websites', fileName), data.toString(),(err) => {
                if (err) {
                    throw err
                }
                console.log('Saved')
            })
        }
    }
}

const traverse = async (browser, newUrl) => {
    const page = await browser.newPage()
    await page.goto(newUrl, { waitUntil: 'load', timeout: 10_000 })
    await contains(page, newUrl)
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    })
    try {
        console.log('--WEBSITE PROCESSOR START PROCESSING', {
            url,
            action_words,
        })
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'load', timeout: 10_000 })
        const hrefs = await page.$$eval('a', links => links.map(a => a.href));
        const uniqueHrefs = [...new Set(hrefs)].filter(x => {
            const exclude = ['youtube', 'medium', 'discord', 'twitter', 'reddit', 'bamboohr', 'github', 'gitlab', 'store', 'app']

            for (const exclusion of exclude) {
                if (x.includes(exclusion)) {
                    return false
                }
            }
            return true
        })
        updateHyperLinks(db, uniqueHrefs, url).catch(console.error)
        await contains(page, url)

        for (const href of uniqueHrefs) {
            await traverse(browser, href)
        }

    } catch (error) {
        console.error(error)
    } finally {
        await browser.close()
        process.exit()
    }
})()
