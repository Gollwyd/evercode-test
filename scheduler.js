const { log } = require('./logger.js');

log('Scheduler run!');

const scheduleTask = (name, interval, task) => {
    const logString = `(scheduleTask) ${name}() invoked with interval ${interval} in scheduler`;
    const callBack = ()=> { log(logString); task() };
    const timerId = setInterval(callBack, interval);
    return { stop: ()=> clearInterval(timerId) };
}

module.exports = { scheduleTask };