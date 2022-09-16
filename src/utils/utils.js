const log = (type, action, data) => console.table({
    type,
    action,
    data,
    time: new Date().toLocaleTimeString(),
})
const error = (data, action = 'error') => log('error', action, data)
const parseActionWords = (word) => {
    const strings = word.split('=')[1]
    return strings.split(',')
}

const getActionWords = argv => {
    const args = argv.find(arg => {
        const containsRe = new RegExp(/action_words=/)
        if (containsRe.test(arg)) {
            return arg
        }
    })
    return args ? parseActionWords(args) : ['mint', 'drop', 'airdrop', 'claim']
}

module.exports = {
    error,
    log,
    parseActionWords,
    getActionWords,
}