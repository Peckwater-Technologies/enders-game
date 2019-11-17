import {GameState, GameAction, GameObservation, Agent, Renderer, Game} from "./interfaces";

export const GameOptions = {
	gameWidth: 4096,
	gameHeight: 2160,
	fps: 5, // so a tick every 1000/30 = 33ms

	playerRadius: 20,
	playerMoveSpeed: 50, // pixels / second
	playerTurnSpeed: 180, // degrees  / second

	sensorRadius: 100,

	noSensors: 20,

	bulletSpeed: 500, // pixels / second
	bulletRadius: 2,
	bulletDamage: 0.5, // amount of player health removed (starting health is 1)
	bulletCooldown: 1, // time between bullets

	treeRadius: 30, //
}

export interface ShooterState extends GameState {
	players: Array < Player > ;
	bullets: Array < Bullet > ;
	obstacles: Array < Obstacle > ;
}

export interface Player {
  x: number,
  y: number,
  angle: number,
  cooldown: number,
}

export interface Bullet {
	sourceAgent: number;
	x: number;
	y: number;
	angle: number;
}

export interface Obstacle {
	x: number;
	y: number;
	shape: ObstacleShape;
	size: number;
}

export enum ObstacleShape {
	Circle,
	Square,
}

export interface ShooterObservation extends GameObservation {
	x: number;
	y: number;
	angle: number;
	cooldown: number; // seconds left

	// Sensors are 0 or 1 (indicating presence)
	enemySensors: Array < number > ;
	bulletSensors: Array < number > ;
	obstacleSensors: Array < number > ;
}


export interface ShooterAction extends GameAction {
  fireBullet: boolean;
  // If both are specified (or none) then don't turn
  turnLeft: boolean;
  turnRight: boolean;
  moveForward: boolean;
}
