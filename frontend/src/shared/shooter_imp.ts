import { Game } from "./interfaces"
import { ShooterAction, ShooterState, ShooterObservation, GameOptions, Player, Bullet, Obstacle, ObstacleShape, } from "./shooter_interfaces";

const delta = 1 / GameOptions.fps;

export class ShooterGame implements Game<ShooterState, ShooterAction, ShooterObservation> {

  createState(seed: number): ShooterState {
    //it's possible to do something more intelligent here after adding obstacles
    let player1 = {
      x: GameOptions.playerRadius,
      y: GameOptions.playerRadius,
      angle: 45,
      cooldown: 0,
    };
    let player2 = {
      x: GameOptions.gameWidth - GameOptions.playerRadius,
      y: GameOptions.gameHeight - GameOptions.playerRadius,
      angle: 225,
      cooldown: 0,
    };

    let tree = {
      x: GameOptions.gameWidth / 3,
      y: GameOptions.gameHeight / 3,
      shape: ObstacleShape.Circle,
      size: GameOptions.playerRadius * 1.5,
    }

    let rock = {
      x: 2 * GameOptions.gameWidth / 3,
      y: 2 * GameOptions.gameHeight / 3,
      shape: ObstacleShape.Square,
      size: GameOptions.playerRadius,
    }

    return {
      players: [player1, player2],
      bullets: [],
      obstacles: [tree, rock],
    };
  }

  updateState(state: ShooterState, actions: ShooterAction[]): ShooterState {
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
        newPlayer = moveObject(newPlayer, GameOptions.playerMoveSpeed * delta, GameOptions.playerRadius);
      }

      newPlayers.push(newPlayer);
    }

    for (const bullet of state.bullets) {
      let collides = false;
      for (let i = 0; i < n; i++) {
        const player = state.players[i];
        if (detectCollision(player, bullet, i)) {
          collides = true;
          break;
        }
      }
      if (!collides) {
        let newBullet = moveObject(bullet, GameOptions.bulletSpeed * delta, 0);
        if (newBullet.x > 0 && newBullet.x < GameOptions.gameWidth && newBullet.y > 0 && newBullet.y < GameOptions.gameHeight){
          newBullets.push(newBullet);
        }
      }
    }

    return { ...state, players: newPlayers, bullets: newBullets };
  }

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

      // Sensors are 0 or 1 (indicating presence)
      enemySensors: enemySensors,
      bulletSensors: bulletSensors,
      obstacleSensors: [], //TODO
    };
  }
}

function detectCollision(player: Player, bullet: Bullet, player_id: number) {
  return Math.hypot(player.x - bullet.x, player.y - bullet.y, 2) < (GameOptions.playerRadius + GameOptions.bulletRadius)
    && bullet.sourceAgent != player_id;
}

function moveObject<T extends { x: number, y: number, angle: number }>(object: T, speed: number, radius: number): T {
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
