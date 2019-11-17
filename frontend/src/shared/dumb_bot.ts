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
  rotate_left = false;
  rotate_right = false;
  move = false;
  shoot = false;
  handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
		console.log('hello world');
		console.log(event);
		if (event.keyCode === 38) {
			this.move = !this.move;
		}
		else
		if (event.keyCode === 40) {
			this.shoot = !this.shoot;
		}
		else
		if (event.keyCode === 37) {
		   this.rotate_left = !this.rotate_left;
		}
		else
		if (event.keyCode === 39) {
		   this.rotate_right = !this.rotate_right;
		}
	}

  constructor() {

  }
  act(state: ShooterObservation): ShooterAction {
    return {
      fireBullet: this.shoot,
      turnLeft: this.rotate_left,
      turnRight: this.rotate_right,
      moveForward: this.move,
    };
  }
}
