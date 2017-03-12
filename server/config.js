const fs = require('fs');
const Hjson = require('hjson');
const os = require('os');

const config = Hjson.parse(fs.readFileSync('config.hjson', 'utf8'));

if (typeof config.workerCount != 'number') {
    if (config.workerCount === 'auto') {
        config.workerCount = os.cpus().length;
    } else {
        config.workerCount = 1;
    }
}

if (config.redis.password === '') {
    delete config.redis.password; //to prevent warning message
}

delete require.cache[require.resolve('./config.js')];

module.exports = config;
