const config = require('./config.js');

const log = (...arg) => {
    const { appName } = config;
    const time = new Date().toISOString();
    const prefix = `[${time}] (${appName}) `;
    console.log(prefix, ...arg);
}

module.exports = { log };