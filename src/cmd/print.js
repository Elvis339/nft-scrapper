const {getAllMetadata} = require("../db/db");

module.exports = async (db) => {
    const rows = await getAllMetadata(db)
    const data = rows.reduce((acc, curr) => {
        const [_, key] = curr.url?.split('https://opensea.io/collection/') || 'unkown'
        return {
            ...acc,
            [key]: curr,
        }
    }, {})

    console.table(data)
}