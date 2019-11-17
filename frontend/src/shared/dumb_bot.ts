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
    let isEnemyInFront = state.enemySensors[0] === 1;
    return {
      fireBullet: isEnemyInFront,
      turnLeft: !isEnemyInFront,
      turnRight: false,
      moveForward: isEnemyInFront,
    };
  }
}

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_MOVE = 38;
const KEY_STOP = 40;
const KEY_SHOOT = 32;

export function realPlayer(): [(event: KeyboardEvent) => void, (event: KeyboardEvent) => void, Agent<ShooterObservation, ShooterAction>] {

  const action = {
    turnLeft: false,
    turnRight: false,
    moveForward: false,
    fireBullet: false
  };


  function keyDown(event: KeyboardEvent): void {
    console.log("Key down");
    switch (event.keyCode) {
      case KEY_LEFT:
        action.turnLeft = true;
        break;
      case KEY_RIGHT:
        action.turnRight = true;
        break;
      case KEY_MOVE:
        action.moveForward = true;
		break;
	  case KEY_STOP:
		action.moveForward = false;
		break;
      case KEY_SHOOT:
        action.fireBullet = true;
        break;
    }
  }

  function keyUp(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case KEY_LEFT:
        action.turnLeft = false;
        break;
      case KEY_RIGHT:
        action.turnRight = false;
        break;
		case KEY_MOVE:
		  action.moveForward = false;
		  break;
		case KEY_SHOOT:
		  action.fireBullet = false;
		  break;
    }
	}

  return [keyUp, keyDown, { act: _ => action }];
}

export class RealPlayer implements Agent<ShooterObservation, ShooterAction> {
  private rotate_left: boolean;
  private rotate_right: boolean;
  private move: boolean;
  private shoot: boolean;

  constructor() {
    this.rotate_left = false;
    this.rotate_right = false;
    this.move = true;
    this.shoot = false;
  }

  keyDown(event: KeyboardEvent): void {
    console.log("Key down");
    switch (event.keyCode) {
      case KEY_LEFT:
        this.rotate_left = true;
        break;
      case KEY_RIGHT:
        this.rotate_right = true;
        break;
      case KEY_MOVE:
        this.move = true;
        break;
		case KEY_STOP:
		  this.move = false;
		  break;
      case KEY_SHOOT:
        this.shoot = true;
        break;
    }
  }

  keyUp(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case KEY_LEFT:
        this.rotate_left = false;
        break;
      case KEY_RIGHT:
        this.rotate_right = false;
        break;
		case KEY_MOVE:
		  this.move = false;
		  break;
		case KEY_SHOOT:
		  this.shoot = false;
		  break;
    }
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
