const {error, log} = require("../utils/utils");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('scrapper');

const tables = `CREATE TABLE IF NOT EXISTS meta_data (
    url TEXT UNIQUE, 
    website TEXT,
    hyperlinks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

const init = (verbose = true) => db.run(tables, (err) => {
    if (err) {
        error(JSON.stringify(err), 'Database Error')
    }
    if (verbose) {
        log('Database', 'Create Table If Not Exist', 'Success')
    }
})

const getAllMetadata = (_db) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM meta_data WHERE website IS NOT NULL;`
        return _db.all(sql, [], (error, rows) => {
            if (error) {
                reject(error)
            }

            if (rows.length === 0) {
                reject(`Empty`)
            }

            resolve(rows)
        })
    })
}

const updateHyperLinks = (_db, hyperlinks, website) => {
    return new Promise((resolve, reject) => {
        if (hyperlinks.length === 0) {
            return resolve()
        }

        const sql = `UPDATE meta_data SET hyperlinks = ? WHERE website = ?`
        _db.run(sql, [JSON.stringify(hyperlinks), website], function (err) {
            if (err) {
                return reject(err)
            }
            console.log(this)
            resolve()
        })
    })
}

module.exports = {
    init,
    db,
    getAllMetadata,
    updateHyperLinks,
}