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

  updateState(state: ShooterState, action: ShooterAction[], dt: number): ShooterState {
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
    for(let i = 0; i < GameOptions.noSensors; i++) {
      let sensorAngle = (angle + i * sensorSpread) / 180 * Math.PI;
      let halfsidevector = [Math.cos(sensorAngle + Math.PI / 2) * GameOptions.playerRadius, Math.sin(sensorAngle + Math.PI / 2) * GameOptions.playerRadius];
      let longsidevector = [Math.cos(sensorAngle) * (GameOptions.playerRadius+GameOptions.sensorRadius), Math.sin(sensorAngle) *(GameOptions.playerRadius+GameOptions.sensorRadius)]
      let a = [x + halfsidevector[0], y + halfsidevector[1]];
      let b = [x - halfsidevector[0], y - halfsidevector[1]];
      let c = [b[0] + longsidevector[0], b[1] + longsidevector[1]];
      let d = [a[0] + longsidevector[0], a[1] + longsidevector[1]];
      let detectionRectangle = [a, b, c, d];

    }
    return {
      x: 0,
      y: 0,
      angle: 0,
      cooldown: 0, // seconds left

      // Sensors are 0 or 1 (indicating presence)
      enemySensors: [0],
      bulletSensors: [0],
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

function isSensorDetecting<T extends {x: number, y:number}>(source: T, object: T, angle: number, radiusOfObject: number) {
  let detectionRectangle = [[], []]
}