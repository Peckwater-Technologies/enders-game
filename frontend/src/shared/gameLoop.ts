import { Game, GameState, GameAction, GameObservation, Renderer, Agent } from "./interfaces";

export function gameLoop<
  State extends GameState, Action extends GameAction, Observation extends GameObservation>(game: Game<State, Action, Observation>, agents: Agent<Observation, Action>[], renderer: Renderer<GameState>, fps: number) {
  let state = game.createState(0);

  function innerLoop() {
    const actions = agents.map((agent, idx) => {
      const obs = game.generateObservation(state, idx)
      return agent.act(obs)
    });
    const { newState, isDone } = game.updateState(state, actions);
    state = newState;

    if (isDone) {
      console.log("Game finished. Restarting...");
      state = game.createState(0);
	  renderer.redeploy(state);
    }

    renderer.render(state);
  }

  setInterval(innerLoop, 1000 / fps);
}