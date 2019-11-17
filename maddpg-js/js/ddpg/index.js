const DDPGAgent = require("./ddpg_agent.js")
const tf = require("@tensorflow/tfjs")

class level{
    constructor(){
        this.events = {};
    }
    loop() {
        
    }
    async load() {
        return true;
    }
    render(){

    }
    steping(){

    }
    shuffle(){

    }
    step(){

    }
    getState(){
        let nState = {};
        let linear = [];
        for(let i = 0; i < 26; i++){
            linear.push(1);
        }
        nState.linear = linear;
        return nState;
    }

}
var env = new level();


// js/DDPG/ddpg.js
var agent = new DDPGAgent(env, {
    stateSize: 26
});


agent.init().then(async () => {

let it = 0;
env.loop(() => {
    let state = env.getState();
    let reward = env.getLastReward();
    const qValue = agent.getQvalue(state.linear, [state.a, state.steering]);
    if (it % 10 == 0)
        console.log(("realtime_viewer", [qValue, state.a, state.steering], reward, ["Q(a, s)", "Acceleration", "Steering Angle"]));
    it += 1;
});

env.load().then(async () => {


    env.render(false);
    await agent.train(false);

    env.steping(false);
    agent.train(true);

    env.shuffle({cars: false});
    
    agent.play();

    agent.stop();
    
    agent.save("model-ddpg-road");

    agent.restore("ddpg-road", "model-ddpg-road")
});
});
