import { Game, StateUpdate } from "./interfaces"
import { ShooterAction, ShooterState, ShooterObservation, GameOptions, Player, Bullet, Obstacle, ObstacleShape, } from "./shooter_interfaces";
import { randBetween, } from "../utils/random";

const delta = 1 / GameOptions.fps;

export const ShooterGame: Game<ShooterState, ShooterAction, ShooterObservation> = {

  createState(seed: number): ShooterState {

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

    let players_result = [player1, player2];
    return {
      players: players_result,
      bullets: [],
      obstacles: generateTrees(players_result, Math.floor(GameOptions.gameWidth * GameOptions.gameHeight / 40000)),
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

      if (action.turnLeft) angle -= (GameOptions.playerTurnSpeed * delta);
      if (action.turnRight) angle += (GameOptions.playerTurnSpeed * delta);
      angle %= 360;

      let newPlayer = {
        ...player,
        cooldown,
        angle,
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

    let sensorSpread = 2 * Math.PI / GameOptions.noSensors;

    //[enemies, bullets, collisions]
    let sensors = [new Array(GameOptions.noSensors), new Array(GameOptions.noSensors), new Array(GameOptions.noSensors)];

    let n = state.players.length;

    function updateSensors(x1: number, y1: number, i: number) {
      if(Math.hypot(x - x1, y - y1) < GameOptions.sensorRadius){

        let direction_vector = [Math.cos(angle / 180 * Math.PI), Math.sin (angle / 180 * Math.PI)];

        let cosofangle = cosangle(direction_vector, [x - x1, y - y1]);
        let modofangle = Math.acos(cosofangle);
        let perpendicularangle = Math.acos(cosangle([direction_vector[1], -direction_vector[0]], [x1, y1]))
        if( perpendicularangle < Math.PI / 2) {
          modofangle = 2 * Math.PI - modofangle;
        }
        let k = Math.floor(modofangle / sensorSpread);
        k = (k + Math.floor(GameOptions.noSensors / 2)) % GameOptions.noSensors
        if(k == GameOptions.noSensors) {k--;}
        sensors[i][k] = 1;
        if(i == 0) {console.log(k + " " + modofangle + " " + cosofangle + " " + angle);}
      }
    };

    for(let j = 0; j < n; j ++) {
      if(j === agentIdx) {continue;}
      let x1 = state.players[j].x;
      let y1 = state.players[j].y;
      updateSensors(x1, y1, 0)
    }
    for(var bullet of state.bullets) {
      if(bullet.sourceAgent == agentIdx) {continue;}
      let x1 = bullet.x;
      let y1 = bullet.y;
      updateSensors(x1, y1, 1);
    }
    for(var obstacle of state.obstacles) {
      let x1 = obstacle.x;
      let y1 = obstacle.y;
      updateSensors(x1, y1, 2);
    }

    return {
      x: x,
      y: y,
      angle: angle,
      cooldown: cooldown, // seconds left
      health: agent.health,

      // Sensors are 0 or 1 (indicating presence)
      enemySensors: sensors[0],
      bulletSensors: sensors[1],
      obstacleSensors: sensors[2],
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
    let stepx = 0.05 * (x - obstacle.x)
    let stepy = 0.05 * (y - obstacle.y)
    switch(obstacle.shape) {
      case ObstacleShape.Circle:
        while(radius + obstacle.size > Math.hypot(x - obstacle.x, y - obstacle.y) + 0.1){
          x += stepx;
          y += stepy;
          if(radius < 1) {
            x = 1000000;
            break;
          }
        }
        break;
      case ObstacleShape.Square:
        //TODO it does the same what circle
        while(radius + obstacle.size > Math.hypot(x - obstacle.x, y - obstacle.y) + 0.1){
          x += stepx;
          y += stepy;
          if(radius < 1) {
            x = 1000000;
            break;
          }
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

function dot(xs: Array<number>, ys: Array<number>) {
  let result = 0;
  let xn = xs.length;
  let yn = ys.length;
  for(let i = 0; i < xn && i < yn; i++) {
    result += xs[i] * ys[i];
  }
  return result;
}

function cosangle(xs: Array<number>, ys: Array<number>) {
  return dot(xs, ys) / Math.sqrt(dot(xs, xs) * dot(ys, ys));
}

function generateTrees(players: Array<Player>, n: number): Array<Obstacle> {
  let trees: Array<Obstacle> = [];
  for(let i = 0; i < n; i++){
    let x = randBetween(0, GameOptions.gameWidth);
    let y = randBetween(0, GameOptions.gameHeight);
    let size = GameOptions.treeRadius;
    let isColliding = false;
    for(let player of players) {
      if(Math.hypot(x - player.x, y - player.y) < GameOptions.playerRadius + size - 0.1) {isColliding = true; break;}
    }
    if(!isColliding){
      trees.push({
        x: x,
        y: y,
        shape: ObstacleShape.Circle,
        size: size,
      });
    }
  }
  return trees;
}
