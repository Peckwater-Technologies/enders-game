const DDPGAgent = require("./ddpg_agent.js")

module.exports = async function(env,  config){
    var agent = new DDPGAgent(env,config);
    return agent.init().then(async () => {
        return  agent;
    });
}