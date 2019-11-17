import {Agent, } from "./interfaces";
import {ShooterObservation, ShooterAction, } from "./shooter_interfaces";

export class DumbAgent implements Agent<ShooterObservation, ShooterAction> {
  act(state: ShooterObservation): ShooterAction {
    return {
      fireBullet: true,
      turnLeft: false,
      turnRight: false,
      moveForward: true,
    };
  }
}

export class StampedeBot implements Agent<ShooterObservation, ShooterAction> {
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

export class RealPlayer implements Agent<ShooterObservation, ShooterAction> {

  constructor() {

  }

  act(state: ShooterObservation): ShooterAction {
    return {
      fireBullet: true,
      turnLeft: !isEnemyInFront,
      turnRight: false,
      moveForward: isEnemyInFront,
    };
  }
}
