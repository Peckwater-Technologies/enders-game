import {ShooterState, ShooterAction, } from "shooter_interfaces"
import {DumbAgent, } from "shooter_agent"
import {SomeRenderer, } from "renderer"


var state: ShooterState = {
  width: 600;
  height: 400;
  x1: 0;
  y1: 0;
  x2: width;
  y2: height;
  angle1: 0.125;
  angle2: 0.625;
  bullets: [];
};

var agent1 = new DumbAgent();
var agent2 = new DumbAgent();

function computeVision(x: number, y: number, angle: number, spread: number, no_sensors: number): Array<number> {

}
while(true) {
  var vision1 = ShooterObservation {
    x: x1;
    y: y1;
    angle: angle1;
    sensors: ;
  }
  //var action1: ShooterAction = agent1.act(state);
  //var action2: ShooterAction = agent2.act(state);

}
