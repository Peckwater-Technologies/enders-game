import * as tf from "@tensorflow/tfjs";
import express from "express";
import { jsonToModel, modelToJson } from "./tfSerialize";

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

const app = express();
const port = 4321;

app.get("/", (req, res) => res.send("Hello World!"));

const model = makeModel(5, 5);

app.get("/models/shooter", async (req, res) => {
  const json = await modelToJson(model);
  res.send(json);
});

app.post("/models/shooter", (req, res) => {
  const data = req.body;
  res.send("TODO");
});

// tslint:disable-next-line: no-console
app.listen(port, () => console.log(`App listening on port ${port}!`));
