import {GameState, GameAction, GameObservation, Agent, Renderer, Game} from "./interfaces"

export interface ShooterState extends GameState {
  width: number;
  height: number;
  agents: Array<[number, number, number]>; //(x, y, angle)
  bullets: Array<Bullet>;
}

export interface Bullet {
  sourceAgent: number;
  x: number;
  y: number;
  angle: number;
}

export interface ShooterObservation extends GameObservation {
  x: number;
  y: number;
  angle: number;
  sensors: Array<number>;
}

export interface ShooterAction extends GameAction {
  fireBullet: boolean;
  angle: number;
  speed: number;
}
