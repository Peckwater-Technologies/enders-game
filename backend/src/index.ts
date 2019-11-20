import * as tf from "@tensorflow/tfjs";
import express from "express";
import { ShooterGame } from "../../frontend/src/shared/shooter_imp";
import { jsonToModel, modelToJson } from "../../frontend/src/shared/tfSerialize";
import {makeModel, mutate} from "./mutate"

const app = express();
const port = 80;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.get("/", (req, res) => res.send("Hello World!"));

let currentModel: tf.LayersModel = makeModel(ShooterGame.observationSize, ShooterGame.actionSize);
let currentPerformance = 0;

app.get("/models/shooter", async (req, res) => {
  const json = await modelToJson(mutate(currentModel, ShooterGame.observationSize, ShooterGame.actionSize));
  res.send(json);
});

app.use(express.json());

app.post("/models/shooter", async (req, res) => {
  const data = req.body;
;
  const performance: number = data.performance;
  if (performance) console.log(req.ip, ': ', performance);
  if (performance > currentPerformance) {
    currentPerformance = performance;
    currentModel = await jsonToModel(data.model);
    res.send("Improvement");
    console.log(req.ip, ': new model improvement');
  } else {
    res.send("Not an improvement");
  }
});

// tslint:disable-next-line: no-console
app.listen(port, () => console.log(`App listening on port ${port}!`));
