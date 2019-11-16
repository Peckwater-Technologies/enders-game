import { Game } from "./interfaces"
import { ShooterAction, ShooterState, ShooterObservation } from "./shooter_interfaces";

class ShooterGame implements Game<ShooterState, ShooterAction, ShooterObservation> {

  createState(seed: number): ShooterState {
    // TODO
    return null;
  }
  
  updateState(state: ShooterState, action: ShooterAction[]): ShooterState {
    // TODO
    return null;
  }

  generateObservation(state: ShooterState, agentIdx: number): ShooterObservation {
    // TODO
    return null;
  }
}