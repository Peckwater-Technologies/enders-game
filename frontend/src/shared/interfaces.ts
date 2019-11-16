interface GameState {

}

interface GameAction {

}

interface Agent<State extends GameState, Action extends GameAction> {
  act(state: State): Action;
}


interface Renderer<State extends GameState> {
  render(state: State): void;
}

interface Game<State extends GameState> {
  initialState: (seed: number) => State;
  renderer: Renderer<State>;
}

/// EXAMPLE --- shooterRenderer.ts

interface ShooterState extends GameState {
  x: number;
  y: number;
  angle: number;
  sensors: Array<number>;
}

interface ShooterAction extends GameAction {
  fireBullet: boolean;
  angle: number;
  speed: number;
}

class DumbAgent implements Agent<ShooterState, ShooterAction> {
  act(state: ShooterState): ShooterAction {
    return {
      fireBullet: true,
      angle: 0,
      speed: 10
    };
  }
}

class SomeRenderer implements Renderer<ShooterState> {
  render(state: ShooterState): void {
    // do some rendering
    // e.g. canvas.fill_rect(state.x, state.y, 10, 10);
  }
}