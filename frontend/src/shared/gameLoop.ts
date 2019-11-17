import { Game, GameState, GameAction, GameObservation, Renderer, Agent } from "./interfaces";
import { existsTypeAnnotation } from "@babel/types";

export type ExitT = {
  totalReward: number;
  steps: number;
}

export function gameLoop<
  State extends GameState, Action extends GameAction, Observation extends GameObservation>(game: Game<State, Action, Observation>, agents: Agent<Observation, Action>[], renderer: Renderer<GameState>, fps: number, exitOnDone: boolean = false, onExit: (t: ExitT) => void = () => {}) {
  let state = game.createState(0);
  let totalReward = 0
  let steps = 0

  function innerLoop() {
    const actions = agents.map((agent, idx) => {
      const obs = game.generateObservation(state, idx)
      return agent.act(obs)
    });
    const { newState, isDone, reward } = game.updateState(state, actions);
    state = newState;

    totalReward += reward[0]
    steps += 1

    if (isDone) {
      if (exitOnDone) {
        clearInterval(interval);
        onExit({ totalReward, steps });
        return;
      }
      console.log("Game finished. Restarting...");
      state = game.createState(0);
	  renderer.redeploy(state);
    }

    renderer.render(state);
  }

  const interval = setInterval(innerLoop, 1000 / fps);

}