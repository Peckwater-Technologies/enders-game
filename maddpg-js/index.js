const DDPGAgent = require("./ddpg_agent.js")

module.exports = async function(level, config){
    var env = new level();
    // js/DDPG/ddpg.js
    var agent = new DDPGAgent(env,config);
    await agent.init()
    env.loop(() => {
        let state = env.getState();
        let reward = env.getLastReward();
    });
    await env.load();
    return  {e: env, a: agent};
}