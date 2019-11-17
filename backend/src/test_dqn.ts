import { makeDQNModel } from "../../frontend/src/shared/dqn_bots";
import { makeModel } from "./index"
import { ShooterGame } from "../../frontend/src/shared/shooter_imp";
import { StampedeBot } from "../../frontend/src/shared/dumb_bot";

const network = makeModel(ShooterGame.observationSize, ShooterGame.actionSize);
const { seeReward, act } = makeDQNModel(network)

let state = ShooterGame.createState(0)
let opponent = new StampedeBot()

const numSteps = 10000;
const logStep = 100;

(async () => {
  let r = 0;

  for (let i = 1; i <= numSteps; i++) {
    const o0 = ShooterGame.generateObservation(state, 0)
    const o1 = ShooterGame.generateObservation(state, 1)

    const { newState, isDone, reward } = ShooterGame.updateState(state, [ await act(o0) , opponent.act(o1) ]);

    state = newState;
    if (isDone) {
      state = ShooterGame.createState(0)
    }

    r += reward[0];
    seeReward(reward[0])

    if (i % logStep === 0) {
      console.log(i + ": " + (r / logStep))
      r = 0
    }
  }
})()