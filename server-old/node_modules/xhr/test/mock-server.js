module.exports = function (req, res) {
    console.log('mock:',req.url)
    if (req.url === '/mock/200ok') {
        res.statusCode = 200
        res.end('')
    } else if (req.url === '/mock/no-content') {
        res.statusCode = 204
        res.end('')
    } else if (req.url === '/mock/timeout') {
        setTimeout(function() {
            res.statusCode = 200
            res.end()
        }, 100)
    } 
}
