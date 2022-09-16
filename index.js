const database = require('./src/db/db')
const {error, parseActionWords} = require('./src/utils/utils');
const traverseCmd = require('./src/cmd/traverse');
const printCmd = require('./src/cmd/print');

/**
 * @param map {Map<string, function>}
 */
const help = map => {
    console.log(`Available commands`)
    for (const [key] of map) {
        console.log(`Command:`, key)
    }
}

(async () => {
    const commands = new Map();
    commands.set('run', traverseCmd)
    commands.set('print', printCmd)
    try {
        if (process.argv.length === 2) {
            return help(commands)
        }

        database.init()
        for (let i = 0; i < process.argv.length; i++) {
            const cmd = process.argv[i]
            if (commands.has(cmd)) {
                const fn = commands.get(cmd)
                await fn(database.db, process.argv)
            }
        }
    } catch (err) {
        console.log(err)
    }
})()