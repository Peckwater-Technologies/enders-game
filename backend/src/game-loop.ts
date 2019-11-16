import {ShooterState, ShooterAction, ShooterObservation, } from "../../frontend/src/shared/shooter_interfaces"
import {DumbAgent, } from "./shooter_agent"
import {SomeRenderer, } from "./renderer"


var state: ShooterState = {
  width: 600,
  height: 400,
  agents: [[0, 0, 0.125], [600, 400, 0.625]],
  bullets: [],
};

var agent1 = new DumbAgent();
var agent2 = new DumbAgent();

function computeVision(x: number, y: number, angle: number, spread: number, no_sensors: number): Array<number> {
  var slice = spread / no_sensors;
  var ray_angle = angle - (spread / 2);
  for(let i = 0; i < no_sensors; i++) {

  }

  return [1];
}

while(true) {
  var vision1 = {
    x: state.agents[0][0],
    y: state.agents[0][1],
    angle: state.agents[0][2],
    sensors: [1],
  };
  //var action1: ShooterAction = agent1.act(state);
  //var action2: ShooterAction = agent2.act(state);

};
