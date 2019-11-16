import {Agent, } from "interfaces.ts"
import {ShooterState, ShooterAction} from "shooter_interfaces"

export class DumbAgent implements Agent<ShooterState, ShooterAction> {
  act(state: ShooterState): ShooterAction {
    return {
      fireBullet: true,
      angle: 0,
      speed: 10
    };
  }
}
