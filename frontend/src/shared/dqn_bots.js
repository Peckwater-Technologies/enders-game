import * as tf from "@tensorflow/tfjs";
import * as ri from "reimprovejs/dist/reimprove";
import { ShooterObservation, ShooterAction } from "./shooter_interfaces";
import { Agent } from "./interfaces";
import { ShooterGame } from "./shooter_imp"
import { input } from "@tensorflow/tfjs";

export function makeDQNModel(network) {

  const model = new ri.Model();
  model.model = network;
  model.fitConfig = {
    epochs: 1,  
    stepsPerEpoch: 16
  };

  const numActions = Math.pow(2, ShooterGame.actionSize)
  const inputSize = ShooterGame.observationSize;
  const temporalWindow = 0; 

  model.compile({loss: 'meanSquaredError', optimizer: 'sgd'})

  const teacherConfig = {
    lessonsQuantity: 10,                   // Number of training lessons before only testing agent
    lessonsLength: 100,                    // The length of each lesson (in quantity of updates)
    lessonsWithRandom: 2,                  // How many random lessons before updating epsilon's value
    epsilon: 1,                            // Q-Learning values and so on ...
    epsilonDecay: 0.995,                   // (Random factor epsilon, decaying over time)
    epsilonMin: 0.05,
    gamma: 0.8                             // (Gamma = 1 : agent cares really much about future rewards)
  };

  const agentConfig = {
    model: model,                          // Our model corresponding to the agent
    agentConfig: {
        memorySize: 5000,                      // The size of the agent's memory (Q-Learning)
        batchSize: 128,                        // How many tensors will be given to the network when fit
        temporalWindow: temporalWindow         // The temporal window giving previous inputs & actions
    }
  };

  const academy = new ri.Academy();    // First we need an academy to host everything
  const teacher = academy.addTeacher(teacherConfig);
  const agent = academy.addAgent(agentConfig);

  academy.assignTeacherToAgent(agent, teacher);

  console.log(academy)
  console.log(teacher)
  console.log(agent)
  
  return {
    act: async (obs) => {
      const data = ShooterGame.getData(obs)
      const actions = await academy.step([{ teacherName: teacher, agentsInput: data }]);
      const res = actions.get(agent)
      return {
        fireBullet: (res & 1) == 1,
        turnLeft: ((res >> 1) & 1) == 1,
        turnRight: ((res >> 2) & 1) == 1,
        moveForward: ((res >> 3) & 1) == 1
      };
    },
    seeReward: r => academy.addRewardToAgent(agent, r)
  }
}