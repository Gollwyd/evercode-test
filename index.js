const { scheduleTask } = require('./scheduler.js');
const { log } = require('./logger.js')

const firstTaskRunnerFunction = () =>{
    const interval = 10_000;
    const { name } = firstTaskRunnerFunction;
    const task = ()=> log('running');
    const scheduleObject = scheduleTask(name, interval, task);
    setTimeout(scheduleObject.stop, 160_000);
}

firstTaskRunnerFunction();