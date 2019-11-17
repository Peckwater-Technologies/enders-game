import {Agent, } from "./interfaces";
import {ShooterObservation, ShooterAction, } from "./shooter_interfaces";

class DumbAgent implements Agent<ShooterObservation, ShooterAction> {
  act(state: ShooterObservation): ShooterAction {
    return {
      fireBullet: true,
      turnLeft: true,
      turnRight: false,
      moveForward: true,
    };
  }
}

class StampedeBot implements Agent<ShooterObservation, ShooterAction> {
  act(state: ShooterObservation): ShooterAction {
    let isEnemyInFront = state.enemySensors[0] == 1;
    return {
      fireBullet: isEnemyInFront,
      turnLeft: !isEnemyInFront,
      turnRight: false,
      moveForward: isEnemyInFront,
    };
  }
}
