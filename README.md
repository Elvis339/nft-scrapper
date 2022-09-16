# NFT Web Scrapper
Scrape NFT projects from OpenSea, try to find action keywords such as claim, mint, drop, airdrop

### Usage
1. `yarn install`
2. `node index.js run` - Run the scrapper
3. `node index.js action_words=something,you,want` - `action_words` is optional flag, defaults to [airdrop, drop, claim, mint]
4. `node index.js print` - Print rows in SQLite

`/websites` directory contains raw HTML from pages that match action keywords