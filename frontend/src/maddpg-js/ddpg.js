const tf = require('@tensorflow/tfjs');
const {Actor, Critic, copyModel, assignAndStd, targetUpdate} = require("./models.js")

function logTfMemory(){
    let mem = tf.memory();
    console.log("numBytes:" + mem.numBytes + 
                "\nnumBytesInGPU:" + mem.numBytesInGPU + 
                "\nnumDataBuffers:" + mem.numDataBuffers + 
                "\nnumTensors:" + mem.numTensors);
}

// This class is called from js/DDPG/ddpg_agent.js
class DDPG {

    /**
     * @param config (Object)
     * @param actor (Actor class)
     * @param critic (Critic class)
     * @param memory (Memory class)
     * @param noise (Noise class)
     */
    constructor(actor, critic, memory, noise, config){
        this.actor = actor;
        this.critic = critic;
        this.memory = memory;
        this.noise = noise;
        this.config = config;

        // Inputs
        

        // Randomly Initialize actor network μ(s)
        
        // Randomly Initialize critic network Q(s, a)
       

 
        // Define in js/DDPG/models.js
        // Init target network Q' and μ' with the same weights
        
    }
    async init(){
        this.obsInput = await tf.input({batchShape: [null, this.config.stateSize]});
        this.actionInput =  await tf.input({batchShape: [null, this.config.nbActions]});
        await this.actor.buildModel(this.obsInput);
        await this.critic.buildModel(this.obsInput, this.actionInput);
        this.actorTarget = await copyModel(this.actor, Actor);
        this.criticTarget = await copyModel(this.critic, Critic);
        this.perturbedActor = await copyModel(this.actor, Actor)
        this.tfGamma = tf.scalar(this.config.gamma);
        await this.setLearningOp();
    }

    async setLearningOp(){
        this.criticWithActor = (tfState) => {
            const tfAct =  this.actor.predict(tfState);
            return this.critic.predict(tfState, tfAct);
        };
        this.criticTargetWithActorTarget = (tfState) => {
            const tfAct = this.actorTarget.predict(tfState);
            return this.criticTarget.predict(tfState, tfAct);
        };

        this.actorOptimiser = tf.train.adam(this.config.actorLr);
        this.criticOptimiser = tf.train.adam(this.config.criticLr);

        this.criticWeights = [];
        for (let w = 0; w < this.critic.model.trainableWeights.length; w++){
            this.criticWeights.push(this.critic.model.trainableWeights[w].val);
        }
        console.log(this.criticWeights);
        this.actorWeights = [];
        for (let w = 0; w < this.actor.model.trainableWeights.length; w++){
            this.actorWeights.push(this.actor.model.trainableWeights[w].val);
        }

        await assignAndStd(this.actor, this.perturbedActor, this.noise.currentStddev, this.config.seed);
    }


    /**
     * Distance Measure for DDPG
     * See parameter space noise Exploration paper
     * @param observations (Tensor2d) Observations
     */
    async distanceMeasure(observations) {
        const pertubedPredictions = await this.perturbedActor.model.predict(observations);
        const predictions = await this.actor.model.predict(observations);

        const distance = await tf.square(pertubedPredictions.sub(predictions)).mean().sqrt();
        return distance;
    }

    /**
     * AdaptParamNoise
     */
    async adaptParamNoise(){
        const batch = await this.memory.getBatch(this.config.batchSize);
        if (batch.obs0.length == 0){
            await assignAndStd(this.actor, this.perturbedActor, this.noise.currentStddev, this.config.seed);
            return [0];
        }

        let distanceV = null;

        if (batch.obs0.length > 0){
            const tfObs0 = tf.tensor2d(batch.obs0);
            const distance = await this.distanceMeasure(tfObs0);
    
            await assignAndStd(this.actor, this.perturbedActor, this.noise.currentStddev, this.config.seed);
            let buf = await distance.buffer();
           distanceV = buf.values;
            tfObs0.dispose();
        }
        return distanceV;
    }

    /**
     * Get the estimation of the Q value given the state
     * and the action
     * @param state number[]
     * @param action [a, steering]
     */
    async getQvalue(state, a){
        const st = tf.tensor2d([state]);
        const tfa = tf.tensor2d([a]);
        const q = await this.critic.model.predict([st, tfa]);
        let buf = await q.buffer();
        const v = buf.values
        st.dispose();
        tfa.dispose();
        q.dispose();
        return v[0];
    }

    /**
     * @param observation (tf.tensor2d)
     * @return (tf.tensor1d)
     */
    async predict(observation){
        const tfActions = await this.actor.model.predict(observation);
        return tfActions;
    }

    /**
     * @param observation (tf.tensor2d)
     * @return (tf.tensor1d)
     */
    async perturbedPrediction(observation){
        const tfActions = await this.perturbedActor.model.predict(observation);
        return tfActions;
    }

    /**
     * Update the two target network
     */
    targetUpdate(){
        // Define in js/DDPG/models.js
        targetUpdate(this.criticTarget, this.critic, this.config);
        targetUpdate(this.actorTarget, this.actor, this.config);
    }
    
    async trainCritic(batch, tfActions, tfObs0, tfObs1, tfRewards, tfTerminals){

        let costs; 
        const criticLoss = this.criticOptimiser.minimize(() => {
            const tfQPredictions0 = this.critic.model.predict([tfObs0, tfActions]);
            const tfQPredictions1 = this.criticTargetWithActorTarget(tfObs1);
            const a2 = tf.mul(tf.mul(tf.sub(tf.scalar(1), tfTerminals), this.tfGamma), tfQPredictions1);
            const tfQTargets = tfRewards.add(a2);
            const a5 = tf.sub(tfQTargets, tfQPredictions0);
            const erros = a5.square();
            let buf = erros.dataSync();
            costs = buf.values;
            return erros.mean();
        }, true, this.criticWeights);

        // For experience Replay
        await this.memory.appendBackWithCost(batch, costs);

        let buf = await criticLoss.buffer()
        const loss = buf.values[0];
        criticLoss.dispose();

        targetUpdate(this.criticTarget, this.critic, this.config);

        return loss;
    }

    async trainActor(tfObs0){

        const actorLoss = this.actorOptimiser.minimize(() => {
            const tfQPredictions0 = this.criticWithActor(tfObs0); 
            return tf.mean(tfQPredictions0).mul(tf.scalar(-1.))
        }, true, this.actorWeights);

        targetUpdate(this.actorTarget, this.actor, this.config);
        const loss = actorLoss.dataSync()[0];
        actorLoss.dispose(); 

        return loss;
    }

    async getTfBatch(){
        // Get batch
        const batch = await this.memory.popBatch(this.config.batchSize);
        // Convert to tensors
        const tfActions = tf.tensor2d(batch.actions);
        const tfObs0 = tf.tensor2d(batch.obs0);
        const tfObs1 = tf.tensor2d(batch.obs1);
        const _tfRewards = tf.tensor1d(batch.rewards);
        const _tfTerminals =  tf.tensor1d(batch.terminals);

        const tfRewards = _tfRewards.expandDims(1);
        const tfTerminals = _tfTerminals.expandDims(1);

        _tfRewards.dispose();
        _tfTerminals.dispose();

        return {
            batch, tfActions, tfObs0, tfObs1, tfRewards, tfTerminals
        }
    }

    async optimizeCritic(){
        const {tfActions, tfObs0, tfObs1, tfRewards, tfTerminals} = await this.getTfBatch();

        const loss = await this.trainCritic(tfActions, tfObs0, tfObs1, tfRewards, tfTerminals);

        tfActions.dispose();
        tfObs0.dispose();
        tfObs1.dispose(); 
        tfRewards.dispose();
        tfTerminals.dispose();

        return loss;
    }

    async optimizeActor(){
        const {tfActions, tfObs0, tfObs1, tfRewards, tfTerminals} = await this.getTfBatch();

        const loss = await this.trainActor(tfObs0);

        tfActions.dispose();
        tfObs0.dispose();
        tfObs1.dispose(); 
        tfRewards.dispose();
        tfTerminals.dispose();

        return loss;
    }

    async optimizeCriticActor(){
        const {batch, tfActions, tfObs0, tfObs1, tfRewards, tfTerminals} = await this.getTfBatch();

        const lossC = await this.trainCritic(batch, tfActions, tfObs0, tfObs1, tfRewards, tfTerminals);
        const lossA = await this.trainActor(tfObs0);

        tfActions.dispose();
        tfObs0.dispose();
        tfObs1.dispose(); 
        tfRewards.dispose();
        tfTerminals.dispose();

        return {lossC, lossA};
    }
}

module.exports = {DDPG,logTfMemory};