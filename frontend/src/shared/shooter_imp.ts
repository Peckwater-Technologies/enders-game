import { Game } from "./interfaces"
import { ShooterAction, ShooterState, ShooterObservation, GameOptions, Player, Bullet, } from "./shooter_interfaces";

class ShooterGame implements Game<ShooterState, ShooterAction, ShooterObservation> {

  createState(seed: number): ShooterState {
    //it's possible to do something more intelligent here after adding obstacles
    var player1 = {
      x: GameOptions.playerRadius,
      y: GameOptions.playerRadius,
      angle: 45,
      cooldown: 0,
    };
    var player2 = {
      x: GameOptions.gameWidth - GameOptions.playerRadius,
      y: GameOptions.gameHeight - GameOptions.playerRadius,
      angle: 225,
      cooldown: 0,
    };

    return {
      players: [player1, player2],
      bullets: [],
    };
  }

  updateState(state: ShooterState, action: ShooterAction[]): ShooterState {
    var dt = 1 / GameOptions.fps;
    var n = state.players.length;
    for(let i = 0; i < n; i++) {
      var curr = action[i];
      var player = state.players[i];
      if (curr.fireBullet && player.cooldown < 0.01) {
        state.bullets.push({sourceAgent: i, x: player.x, y: player.y, angle: player.angle});
        player.cooldown = GameOptions.bulletCooldown;
      }
      if (curr.turnLeft && !curr.turnRight) {
        player.angle -= GameOptions.playerTurnSpeed * dt % 360;
      }
      else if (!curr.turnLeft && curr.turnRight) {
        player.angle += GameOptions.playerTurnSpeed * dt % 360;
      }
      if (curr.moveForward) {
        player = moveObject(player, GameOptions.playerMoveSpeed, GameOptions.playerRadius);
      }
      player.cooldown -= dt;
      if(player.cooldown < 0) {player.cooldown = 0;}
    }
    var newbullets = [];
    for(var bullet of state.bullets) {
      for(let i = 0; i < n; i++) {
        player = state.players[n];
        if(detectCollision(player, bullet, n)) {
          //TODO actual collision handle
        }
        else {
          bullet = moveObject(bullet, GameOptions.bulletSpeed, 0);
          if(detectCollision(player, bullet, n)) {
            //TODO actual collision handle
          }
          else if(bullet.x > 0 && bullet.x < GameOptions.gameWidth && bullet.y > 0 && bullet.y < GameOptions.gameHeight){
            newbullets.push(bullet);
          }
        }
      }
    }
    state.bullets = newbullets;
    return state;
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
        if(j == agentIdx) {continue;}
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
