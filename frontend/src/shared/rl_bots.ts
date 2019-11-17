import maddpg from "../../../maddpg-js";

import {Agent, Game, GameState, } from "./interfaces";
import {ShooterObservation, ShooterAction, } from "./shooter_interfaces";
import * as tf from "@tensorflow/tfjs";

class level{
    events: {};
    constructor(step: function ){
        this.events = {};
    }
    loop() {}
    async load() {return true;}
    render(){}
    steping(){}
    shuffle(){}
    step(action_prev: number[], prev_state: number[], action_current:number[]){
        console.log(prev_state)
        if(prev_state[0] > 0.5){
            return action_prev[0] - action_prev[1];
        }
        if(prev_state[0] < 0.5){
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

};

export class RLNetBot<State, Action, Observation> implements Agent<number[], number[]> {
    
  private agent :any;
  private env: any;
  private game : Game<State, Action, Observation>;


  constructor(game: Game<State, Action, Observation>) {
    this.game = game;
    let {e,a} = maddpg(level, {
        stateSize: game.observationSize,
        nbActions: game.actionSize,
    })
    this.agent = a;
    this.env = e;
  }

  act(state: number[]): number[] {
    const out = this.network.predict(tf.tensor2d([state])) as tf.Tensor
    const data = Array.from(out.dataSync())
    out.dispose();
    return data;
  }
}

export function MappedRLNetBot<State, Action, Observation>(game: Game<State, Action, Observation>): Agent<Observation, Action> {
  const netBot = new RlNetBot(game);
  return { act: obs => game.getAction(netBot.act(game.getData(obs))) };
}