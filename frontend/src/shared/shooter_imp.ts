import { Game, StateUpdate } from "./interfaces"
import { ShooterAction, ShooterState, ShooterObservation, GameOptions, Player, Bullet, Obstacle, ObstacleShape, } from "./shooter_interfaces";

import {randBetween} from '../utils/random';

const delta = 1 / GameOptions.fps;

export const ShooterGame: Game<ShooterState, ShooterAction, ShooterObservation> = {

  createState(seed: number): ShooterState {

    const players = [
		{
			"x": [200, 3800],
			"y": [100, 1900],
			"angle": [0, 360]
		},
		{
			"x": [200, 3800],
			"y": [100, 1900],
			"angle": [0, 360]
		}
    ];

    //it's possible to do something more intelligent here after adding obstacles
    let player1 = {
      x: randBetween(GameOptions.playerRadius, GameOptions.gameWidth - GameOptions.playerRadius),
      y: randBetween(GameOptions.playerRadius, GameOptions.gameHeight - GameOptions.playerRadius),
      angle: 45,
      cooldown: 0,
      health: 1,
    };
    let player2 = {
		x: randBetween(GameOptions.playerRadius, GameOptions.gameWidth - GameOptions.playerRadius),
		y: randBetween(GameOptions.playerRadius, GameOptions.gameHeight - GameOptions.playerRadius),
      angle: 225,
      cooldown: 0,
      health: 1,
    };

    let tree = {
      x: GameOptions.gameWidth / 3,
      y: GameOptions.gameHeight / 3,
      shape: ObstacleShape.Circle,
      size: GameOptions.treeRadius,
    }

    let rock = {
      x: 2 * GameOptions.gameWidth / 3,
      y: 2 * GameOptions.gameHeight / 3,
      shape: ObstacleShape.Square,
      size: GameOptions.treeRadius,
    }

    return {
      players: [player1, player2],
      bullets: [],
      obstacles: [tree, rock],
    };
  },

  updateState(state: ShooterState, actions: ShooterAction[]): StateUpdate<ShooterState> {
    const n = state.players.length;

    const newBullets = [];
    const newPlayers = [];

    for (let i = 0; i < n; i++) {
      const player = state.players[i];
      const action = actions[i];

      let cooldown = player.cooldown;
      let angle = player.angle;

      if (action.fireBullet && player.cooldown < 0.01) {
        newBullets.push({sourceAgent: i, x: player.x, y: player.y, angle: player.angle});
        cooldown = GameOptions.bulletCooldown;
      } else {
        cooldown = Math.max(0, cooldown - delta);
      }

      if (action.turnLeft) angle -= (GameOptions.playerTurnSpeed * delta) % 360;
      if (action.turnRight) angle += (GameOptions.playerTurnSpeed * delta) % 360;

      let newPlayer = {
        ...player,
        cooldown,
        angle
      };
      if (action.moveForward) {
        newPlayer = moveObject(newPlayer, GameOptions.playerMoveSpeed * delta, GameOptions.playerRadius, state.obstacles);
      }

      newPlayers.push(newPlayer);
    }

    const damagePerPlayer = Array(n).fill(0);

    for (const bullet of state.bullets) {
      let collides = false;
      for (let i = 0; i < n; i++) {
        const player = state.players[i];
        if (detectCollision(player, bullet, i)) {
          collides = true;
          damagePerPlayer[i] += GameOptions.bulletDamage;
          break;
        }
      }
      if (!collides) {
        let newBullet = moveObject(bullet, GameOptions.bulletSpeed * delta, 0, state.obstacles);
        if (newBullet.x > 0 && newBullet.x < GameOptions.gameWidth && newBullet.y > 0 && newBullet.y < GameOptions.gameHeight){
          newBullets.push(newBullet);
        }
      }
    }

    let done = false;
    for (let i = 0; i < n; i++) {
      newPlayers[i].health -= damagePerPlayer[i];
      if (newPlayers[i].health < 0.01) {
        done = true;
      }
    }

    return {
      newState: { ...state, players: newPlayers, bullets: newBullets },
      isDone: done,
      reward: damagePerPlayer.map(x => -x),
    };
  },

  generateObservation(state: ShooterState, agentIdx: number): ShooterObservation {
    let agent = state.players[agentIdx];
    let x = agent.x;
    let y = agent.y;
    let angle = agent.angle;
    let cooldown = agent.cooldown;

    let sensorSpread = 360 / GameOptions.noSensors;

    let enemySensors = [];
    let bulletSensors = [];
    for(let i = 0; i < GameOptions.noSensors; i++) {
      let sensorAngle = (angle + i * sensorSpread) / 180 * Math.PI;
      let halfsidevector: [number, number] = [Math.cos(sensorAngle + Math.PI / 2), Math.sin(sensorAngle + Math.PI / 2)];
      let longsidevector: [number, number] = [Math.cos(sensorAngle), Math.sin(sensorAngle)];
      let playerDetectionRectangle: Array<[number, number]> = rectangle(x, y, GameOptions.playerRadius, halfsidevector, longsidevector);
      let bulletDetectionRectangle: Array<[number, number]> = rectangle(x, y, GameOptions.bulletRadius, halfsidevector, longsidevector);

      let enemyDetected = 0;
      let bulletDetected = 0;
      let n = state.players.length;
      for(let j = 0; j < n; j ++) {
        if(j === agentIdx) {continue;}
        if(isInside(playerDetectionRectangle, [state.players[j].x, state.players[j].y])){
          enemyDetected = 1;
          break;
        }
      }
      for(var bullet of state.bullets) {
        if(bullet.sourceAgent != agentIdx && isInside(bulletDetectionRectangle, [bullet.x, bullet.y])) {
          bulletDetected = 1;
          break;
        }
      }
      enemySensors.push(enemyDetected);
      bulletSensors.push(bulletDetected);
    }
    return {
      x: x,
      y: y,
      angle: angle,
      cooldown: cooldown, // seconds left
      health: agent.health,

      // Sensors are 0 or 1 (indicating presence)
      enemySensors: enemySensors,
      bulletSensors: bulletSensors,
      obstacleSensors: [], //TODO
    };
  },

  observationSize: 5 + 3 * GameOptions.noSensors,
  getData(observation: ShooterObservation): number[] {
    return [
      observation.x,
      observation.y,
      observation.angle,
      observation.cooldown,
      observation.health,
      ...observation.obstacleSensors,
      ...observation.enemySensors,
      ...observation.bulletSensors,
    ];
  },

  actionSize: 4,
  getAction(data: number[]): ShooterAction {
    return {
      fireBullet: data[0] > 0.5,
      turnLeft: data[1] > 0.5,
      turnRight: data[2] > 0.5,
      moveForward: data[3] > 0.5,
    }
  }
}

function detectCollision(player: Player, bullet: Bullet, player_id: number) {
  return Math.hypot(player.x - bullet.x, player.y - bullet.y, 2) < (GameOptions.playerRadius + GameOptions.bulletRadius)
    && bullet.sourceAgent != player_id;
}

function moveObject<T extends { x: number, y: number, angle: number }>(object: T, speed: number, radius: number, obstacles: Array<Obstacle>): T {
  let radians = object.angle / 180 * Math.PI;
  let x = object.x + Math.cos(radians) * speed;
  let y = object.y + Math.sin(radians) * speed;
  if (x > GameOptions.gameWidth - radius) {
    x = GameOptions.gameWidth - radius;
  }
  else if (x < radius) {
    x = radius;
  }
  if (y > GameOptions.gameHeight - radius) {
    y = GameOptions.gameHeight - radius;
  }
  else if (y < radius) {
    y = radius;
  }

  for(let obstacle of obstacles) {
    let stepx = 0.05 * (obstacle.x - x)
    let stepy = 0.05 * (obstacle.y - y)
    switch(obstacle.shape) {
      case ObstacleShape.Circle:
        while(radius + obstacle.size > Math.hypot(x - obstacle.x, y - obstacle.y) + 0.1){
          x += stepx;
          y += stepy;
        }
        break;
      case ObstacleShape.Square:
        //TODO it does the same what circle
        while(radius + obstacle.size > Math.hypot(x - obstacle.x, y - obstacle.y) + 0.1){
          x += stepx;
          y += stepy;
        }
        break;
    }
  }
  return {
    ...object,
    x: x,
    y: y,
  };
}

//https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
function isInside(rectangle: Array<[number, number]>, point: [number, number]) {
  let AM = [point[0] - rectangle[0][0], point[1] - rectangle[0][1]];
  let AB = [rectangle[1][0] - rectangle[0][0], rectangle[1][1] - rectangle[0][1]];
  let AD = [rectangle[3][0] - rectangle[0][0], rectangle[3][1] - rectangle[0][1]];
  let AMdotAB = dot(AM, AB);
  let AB2 = dot(AB, AB);
  let AMdotAD = dot(AM, AD);
  let AD2 = dot(AD, AD);
  return (0 < AMdotAB && AMdotAB < AB2 && 0 < AMdotAD && AMdotAD < AD2);
}

function rectangle(x: number, y: number, radius: number, shortvector: [number, number], longvector: [number, number]): Array<[number, number]> {
  let halfsidevector = [shortvector[0] * radius, shortvector[1] * radius];
  let longsidevector = [longvector[0] * (radius+GameOptions.sensorRadius), longvector[1] *(radius+GameOptions.sensorRadius)]
  let a: [number, number] = [x + halfsidevector[0], y + halfsidevector[1]];
  let b: [number, number] = [x - halfsidevector[0], y - halfsidevector[1]];
  let c: [number, number] = [b[0] + longsidevector[0], b[1] + longsidevector[1]];
  let d: [number, number] = [a[0] + longsidevector[0], a[1] + longsidevector[1]];
  return [a, b, c, d];
}

function dot(xs: Array<number>, ys: Array<number>) {
  let result = 0;
  let xn = xs.length;
  let yn = ys.length;
  for(let i = 0; i < xn && i < yn; i++) {
    result += xs[i] * ys[i];
  }
  return result;
}
