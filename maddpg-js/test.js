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
    step(action_prev, prev_state, action_current){
        console.log(prev_state)
        if(prev_state > 0.5){
            return action_prev[0] - action_prev[1];
        }
        if(prev_state < 0.5){
            return action_prev[1] - action_prev[0];
        }
        return -0.5
       
    }
    getState(){
        let nState = {};
        let linear = [];
        for(let i = 0; i < 1; i++){
            linear.push( Math.round(Math.random()) );
        }
        nState.linear = linear;
        return nState;
    }

}
var env = new level();


// js/DDPG/ddpg.js
var agent = new DDPGAgent(env, {
    stateSize: 5
});


agent.init().then(async () => {
  let it = 0;
  env.loop(() => {
      let state = env.getState();
      let reward = env.getLastReward();
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