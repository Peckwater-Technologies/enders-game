import { makeDQNModel } from "../../frontend/src/shared/dqn_bots";
import { makeModel } from "./index"
import { ShooterGame } from "../../frontend/src/shared/shooter_imp";
import { StampedeBot } from "../../frontend/src/shared/dumb_bot";

const network = makeModel(ShooterGame.observationSize, ShooterGame.actionSize);
const { act } = makeDQNModel(network)

let state = ShooterGame.createState(0)
let opponent = new StampedeBot()

const numSteps = 10000;
const logStep = 100;

console.log("here");
(async () => {
  console.log(await act(ShooterGame.generateObservation(state, 0)))
})();