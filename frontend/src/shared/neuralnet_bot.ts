import {Agent, Game, } from "./interfaces";
import {ShooterObservation, ShooterAction, } from "./shooter_interfaces";
import * as tf from "@tensorflow/tfjs";

export class NeuralNetBot implements Agent<number[], number[]> {

  private network: tf.LayersModel;

  constructor(network: tf.LayersModel) {
    this.network = network
  }

  act(state: number[]): number[] {
    const out = this.network.predict(tf.tensor2d([state])) as tf.Tensor
    const data = Array.from(out.dataSync())
    out.dispose();
    return data;
  }
}

export function MappedNeuralNetBot<State, Action, Observation>(network: tf.LayersModel, game: Game<State, Action, Observation>): Agent<Observation, Action> {
  const netBot = new NeuralNetBot(network)
  return { act: obs => game.getAction(netBot.act(game.getData(obs))) };
}