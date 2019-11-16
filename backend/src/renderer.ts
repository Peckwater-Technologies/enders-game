import {Renderer, } from "../../frontend/src/shared/interfaces"
import {ShooterState, } from "../../frontend/src/shared/shooter_interfaces"

export class SomeRenderer implements Renderer<ShooterState> {
  render(state: ShooterState): void {
    // do some rendering
    // e.g. canvas.fill_rect(state.x, state.y, 10, 10);
  }
}
