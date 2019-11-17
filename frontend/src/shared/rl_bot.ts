
/*
import maddpg from "../maddpg-js";

import {Agent, Game, GameState, } from "./interfaces";
import {ShooterObservation, ShooterAction, } from "./shooter_interfaces";
import * as tf from "@tensorflow/tfjs";
import { async } from "q";

class Level<State, Action, Observation>{
    state: State ;
    game: Game<State, Action, Observation>;
    constructor(game: Game<State, Action, Observation>){
        this.game = game;
        this.state = game.createState(0);
    }
    step(action: number[]){
        console.log(this.state)
        let stateUpdate = this.game.updateState(this.state, [this.game.getAction(action)])
        this.state = stateUpdate.newState;
        if(stateUpdate.isDone){
            return -1;
        }
        return stateUpdate.reward;
    }
    getState(){
        return this.game.getData(this.game.generateObservation(this.state,0));
    }

};

export class RLNetBot<State, Action, Observation> implements Agent<number[], number[]> {
  //@ts-ignore
  private agent;
  private env: Level<State, Action, Observation>;
  private game : Game<State, Action, Observation>;


  constructor(game: Game<State, Action, Observation>) {
    this.game = game;
    this.env = new Level(game)
    //@ts-ignore
    
  }
  async init(){
    this.agent = await maddpg(this.env, {
      stateSize: this.game.observationSize,
      nbActions: this.game.actionSize,
    })
  }
  //@ts-ignore
  act(state: number[]): number[] {
    //@ts-ignore
    const out = this.agent.play(tf.tensor2d([state])) as tf.Tensor
    // @ts-ignore
    const data = Array.from(out.dataSync())
    out.dispose();
    return data;
  }
}

export async function MappedRLNetBot<State, Action, Observation>(game: Game<State, Action, Observation>) {
  const netBot = new RLNetBot(game);
  return Promise.resolve(netBot.init()).then(
    () => {return { act: obs => game.getAction(netBot.act(game.getData(obs))) };}
  )
} 

*/