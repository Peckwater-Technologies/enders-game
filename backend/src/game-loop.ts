import {ShooterState, } from "shooter_interfaces"
import {DumbAgent, } from "shoote_agent"


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

var agent1: Agent<ShooterState, ShooterAction> = new DumbAgent();
var agent2: Agent<ShooterState, ShooterAction> = new DumbAgent();

while(true) {

}
