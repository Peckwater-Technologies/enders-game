// @ts-ignore
export interface GameState {

}

export interface GameAction {

}

export interface GameObservation {

}

export interface Agent<Observation extends GameObservation, Action extends GameAction> {
  act(observation: Observation): Action;
}

export interface Renderer<State extends GameState> {
  render(state: State): void;
}

export interface Game<State extends GameState, Action extends GameAction, Observation extends GameObservation> {
  createState: (seed: number) => State;
  generateObservation: (state: State, agentIdx: number) => Observation;
  updateState: (state: State, actions: Action[]) => State;
}