const puppeteer = require("puppeteer");
const {fork} = require("child_process");
const path = require("path");
const {error, getActionWords} = require("../utils/utils");

const URL = 'https://opensea.io/rankings?sortBy=one_day_volume&chain=ethereum';

const normalizeHrefArray = arr => {
    const set = new Set()

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            let current = arr[i][j]
            if (!set.has(current)) {
                set.add(current)
            }
        }
    }

    return set
}

const traverse = async (db, argv) => {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        })
        const page = await browser.newPage()
        await page.goto(URL, { waitUntil: 'load' })
        const selector = 'div[role="list"]';
        const divParent = await page.$(selector);
        const listHandle = await page.evaluateHandle(e => e.children, divParent);
        const properties = await listHandle.getProperties();
        const hrefs = []
        for (const property of properties.values()) {
            const element = property.asElement();
            const aTagSelector = 'div > a'
            const href = await element.$$eval(aTagSelector, elements => elements.map(e => e.getAttribute('href')))

            hrefs.push(href)
        }
        await browser.close()
        const uriToTraverse = Array.from(normalizeHrefArray(hrefs))
        let rootUrl = ''

        for (let i = 0; i < uriToTraverse.length; i++) {
            let uri = uriToTraverse[i]
            rootUrl = 'https://opensea.io'.concat(uri)
            const thread = fork(path.join(__dirname, 'opensea.processor.js'), [
                rootUrl
            ])
            thread.on('message', url => {
                const websiteThreadProcessor = fork(path.join(__dirname, 'website.processor.js'), [url, argv, rootUrl])
                websiteThreadProcessor.on('exit', () => {
                    if (websiteThreadProcessor) {
                        websiteThreadProcessor.kill()
                        return
                    }
                })

                websiteThreadProcessor.on('error', (err) => {
                    if (err) {
                        console.error(err)
                    }
                })
            })

            thread.on('error', (err) => {
                if (err) {
                    error(JSON.stringify(err))
                }
            })
            thread.on('exit', () => {
                if (thread) {
                    thread.kill()
                    return
                }
            })
        }
}

module.exports = traverse