import {Agent, } from "../../frontend/src/shared/interfaces"
import {ShooterObservation, ShooterAction} from "../../frontend/src/shared/shooter_interfaces"

export class DumbAgent implements Agent<ShooterObservation, ShooterAction> {
  act(state: ShooterObservation): ShooterAction {
    return {
      fireBullet: true,
      angle: 0,
      speed: 10
    };
  }
}
