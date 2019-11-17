import * as tf from "@tensorflow/tfjs";
import { layerNormalization } from "@tensorflow/tfjs-layers/dist/exports_layers";


const hiddenLayers = [ 40 ];

export function makeModel(inputCount: number, outputCount: number): tf.Sequential {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    activation: "relu",
    inputShape: [inputCount],
    kernelInitializer: "randomNormal",
    units: hiddenLayers[0],
  }));
  for (let i = 1; i < hiddenLayers.length; i++) {
    model.add(tf.layers.dense({ units: hiddenLayers[i], activation: "relu" }));
  }
  model.add(tf.layers.dense({ units: outputCount, activation: "softmax", kernelInitializer: "randomNormal" }));
  return model;
}

export function mutate(model: tf.LayersModel, inputCount: number, outputCount: number): tf.LayersModel {
  const newOne = makeModel(inputCount, outputCount)
  newOne.layers.forEach((l: tf.LayersModel, i: number) => {
    l.setWeights(model.layers[i].getWeights().map(x => x.add(tf.randomNormal(x.shape))))
  })
  return newOne
}