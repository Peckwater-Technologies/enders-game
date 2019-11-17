import { jsonToModel, modelToJson } from "./shared/tfSerialize"
import { gameLoop } from "./shared/gameLoop";
import { ShooterGame } from "./shared/shooter_imp";
import { MappedNeuralNetBot } from "./shared/neuralnet_bot";
import { StampedeBot } from "./shared/dumb_bot";

async function getNetModel() {
  const res = await fetch("http://localhost:4321/models/shooter")
  const text = await res.text()
  const model = await jsonToModel(text)
  
  return model;
}

async function doEvent() {
  const model = await getNetModel();
  console.log("Got model...")
  return new Promise<void>(resolve => {
    gameLoop(
      ShooterGame,
      [ MappedNeuralNetBot(model, ShooterGame), new StampedeBot() ],
      { render: () => { }, redeploy: () => { } },
      200,
      true,
      ({ totalReward, steps }) => {
        console.log("Done")
        modelToJson(model).then(json => {
          fetch("http://localhost:4321/models/shooter", { method: 'POST', body: json }).then(() => {
            resolve()
            console.log("DONE!")
          })
        });
      }
    )
  });
}

export async function computeLoop() {
  while (true) {
    await doEvent();
  }
}