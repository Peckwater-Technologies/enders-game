const AdaptiveParamNoiseSpec = require("./noise.js")
const PrioritizedMemory = require("./prioritized_memory.js")
const {Actor, Critic, copyModel,  copyFromSave} = require("./models.js")
const {DDPG, logTfMemory} = require("./ddpg.js")
const tf = require('@tensorflow/tfjs');
var seedrandom = require('seedrandom');


// This class is called from js/DDPG/index.js
export class DDPGAgent {

    /**
     * @param env (metacar.env) Set in js/DDPG/index.js
     */
    constructor(env, config){

        this.stopTraining = false;
        this.env = env;

        config = config || {};
        // Default Config
        this.config = {
            "stateSize": config.stateSize || 17,
            "nbActions": config.nbActions || 2,
            "seed": config.seed || 0,
            "batchSize": config.batchSize || 128,
            "actorLr": config.actorLr || 0.0001,
            "criticLr": config.criticLr || 0.001,
            "memorySize": config.memorySize || 30000,
            "gamma": config.gamme || 0.99,
            "noiseDecay": config.noiseDecay || 0.99,
            "rewardScale": config.rewardScale || 1,
            "nbEpochs": config.nbEpochs || 2000,
            "nbEpochsCycle": config.nbEpochsCycle || 5,
            "nbTrainSteps": config.nbTrainSteps || 110,
            "tau": config.tau || 0.008,
            "initialStddev": config.initialStddev || 0.1,
            "desiredActionStddev": config.desiredActionStddev || 0.1,
            "adoptionCoefficient": config.adoptionCoefficient || 1.01,
            "actorFirstLayerSize": config.actorFirstLayerSize || 64,
            "actorSecondLayerSize": config.actorSecondLayerSize || 32,
            "criticFirstLayerSSize": config.criticFirstLayerSSize || 64,
            "criticFirstLayerASize": config.criticFirstLayerASize || 64,
            "criticSecondLayerSize": config.criticSecondLayerSize || 32,
            "maxStep": config.maxStep || 800,
            "stopOnRewardError": config.stopOnRewardError != undefined ? config.stopOnRewardError:true,
            "resetEpisode": config.resetEpisode != undefined ? config.resetEpisode:false,
            "saveDuringTraining": config.saveDuringTraining || false,
            "saveInterval": config.saveInterval ||  20
        };
        this.epoch = 0;
        // From js/DDPG/noise.js
        this.noise = new AdaptiveParamNoiseSpec(this.config);

        // Configure components.

        // Buffer replay
        // The baseline use 1e6 but this size should be enough for this problem
        this.memory = new PrioritizedMemory(this.config.memorySize);
        // Actor and Critic are from js/DDPG/models.js
        this.actor = new Actor(this.config);
        this.critic = new Critic(this.config);

        // Seed javascript
        seedrandom(0);

        this.rewardsList = [];
        this.epiDuration = [];

        // DDPG
        this.ddpg = new DDPG(this.actor, this.critic, this.memory, this.noise, this.config);
    }
    async init(){
        await this.ddpg.init();
    }

    save(name){
        /*
            Save the network
        */
       //this.ddpg.critic.model.save('file://critic-' + name);
       //this.ddpg.actor.model.save('file://actor-'+ name);
    }

    async restore(folder, name){
        /*
            Restore the weights of the network
        */
        const critic = await tf.loadLayersModel('https://metacar-project.com/public/models/'+folder+'/critic-'+name+'.json');
        const actor = await tf.loadLayersModel("https://metacar-project.com/public/models/"+folder+"/actor-"+name+".json");

        this.ddpg.critic = copyFromSave(critic, Critic, this.config, this.ddpg.obsInput, this.ddpg.actionInput);
        this.ddpg.actor = copyFromSave(actor, Actor, this.config, this.ddpg.obsInput, this.ddpg.actionInput);

        // Define in js/DDPG/models.js
        // Init target network Q' and μ' with the same weights
        this.ddpg.actorTarget = copyModel(this.ddpg.actor, Actor);
        this.ddpg.criticTarget = copyModel(this.ddpg.critic, Critic);
        // Perturbed Actor (See parameter space noise Exploration paper)
        this.ddpg.perturbedActor = copyModel(this.ddpg.actor, Actor);
        //this.adaptivePerturbedActor = copyModel(this.actor, Actor);
        this.ddpg.setLearningOp();
    }

    /**
     * Play one step
     */
    async play(state){
        // Get the current state
        console.log(state)
        // Pick an action
        const tfActions = await this.ddpg.predict(tf.tensor2d([state]));
        let buf = await tfActions.buffer()
        const actions = buf.values;
        tfActions.dispose();
        return this.env.step(actions);
    }

    /**
     * Get the estimation of the Q value given the state
     * and the action
     * @param state number[]
     * @param action [a, steering]
     */
    getQvalue(state, a){
        return this.ddpg.getQvalue(state, a);
    }

    stop(){
        this.stopTraining = true;
    }

    /**
     * Step into the training environement
     * @param tfPreviousStep (tf.tensor2d) Current state
     * @param mPreviousStep number[]
     * @return {done, state} One boolean and the new state
     */
    async stepTrain(tfPreviousStep, mPreviousStep){
        // Get actions
        const tfActions = await this.ddpg.perturbedPrediction(tfPreviousStep);
        // Step in the environment with theses actions
        let buf = await tfActions.buffer();
        let mAcions = buf.values;
        console.log(mAcions)
        let mReward = await this.env.step(mAcions,  tfPreviousStep.dataSync());
        console.log(mReward);
        this.rewardsList.push(mReward);
        // Get the new observations
        let mState = await this.env.getState().linear;
        let tfState = await tf.tensor2d([mState]);
        let mDone = 0;
        if (mReward == -1 && this.config.stopOnRewardError){
            mDone = 1;
        }
        // Add the new tuple to the buffer
        await this.ddpg.memory.append(mPreviousStep, mAcions, mReward, mState, mDone);
        // Dispose tensors
        tfPreviousStep.dispose();
        tfActions.dispose();

        return {mDone, mState, tfState};
    }

    /**
     * Optimize models and log states
     */
    async _optimize(){
        this.ddpg.noise.desiredActionStddev = await Math.max(0.1, this.config.noiseDecay * this.ddpg.noise.desiredActionStddev);
        let lossValuesCritic = [];
        let lossValuesActor = [];
        console.time("Training");
        for (let t=0; t < this.config.nbTrainSteps; t++){
            let {lossC, lossA} = await this.ddpg.optimizeCriticActor();
            await lossValuesCritic.push(lossC);
            await lossValuesActor.push(lossA);
        }
        console.timeEnd("Training");
        console.log("desiredActionStddev:", this.ddpg.noise.desiredActionStddev);
    }

    /**
     * Train DDPG Agent
     */
    async train(realTime){
        this.stopTraining = false;
        // One epoch
        for (this.epoch; this.epoch < this.config.nbEpochs; this.epoch++){
            // Perform cycles.
            this.rewardsList = [];
            this.stepList = [];
            this.distanceList = [];
            for (let c=0; c < this.config.nbEpochsCycle; c++){
                console.log(c);
                if (c%10==0){ logTfMemory(); }
                let mPreviousStep = await this.env.getState().linear;
                let tfPreviousStep = await tf.tensor2d([mPreviousStep]);
                let step = 0;

                console.time("LoopTime");
                for (step=0; step < this.config.maxStep; step++){
                    let rel = await this.stepTrain(tfPreviousStep, mPreviousStep);
                    mPreviousStep = rel.mState;
                    tfPreviousStep = rel.tfState;
                    if (rel.mDone && this.config.stopOnRewardError){
                        console.timeEnd("LoopTime");
                        break;
                    }
                    if (this.stopTraining){
                        return;
                    }
                    if (realTime && step % 10 == 0)
                        await tf.nextFrame();
                }
                this.stepList.push(step);
                console.timeEnd("LoopTime");
                let distance = await this.ddpg.adaptParamNoise();
                this.distanceList.push(distance[0]);

                if (this.config.resetEpisode){
                    this.env.reset();
                }
                tfPreviousStep.dispose();
                console.log("e="+ this.epoch +", c="+c);
         
                await tf.nextFrame();
            }
            if (this.epoch > 5){
                await this._optimize();
            }
            if (this.config.saveDuringTraining && this.epoch % this.config.saveInterval == 0 && this.epoch != 0){
                await this.save("model-ddpg-traffic-epoch-"+this.epoch);
            }
            await tf.nextFrame();
        }
    }

}
