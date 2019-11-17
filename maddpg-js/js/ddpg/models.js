const tf = require('@tensorflow/tfjs');

/**
 * Copy a model
 * @param model Actor|Critic instance
 * @param instance Actor|Critic
 * @return Copy of the model
 */
async function copyFromSave(model, instance, config, obs, action){
    let nModel = new instance(config);
    // action might be not required
    await nModel.buildModel(obs, action);
    const weights = model.weights;
    for (let m=0; m < weights.length; m++){
        nModel.model.weights[m].val.assign(weights[m].val);
    }
    return nModel;
}


/**
 * Copy a model
 * @param model Actor|Critic instance
 * @param instance Actor|Critic
 * @return Copy of the model
 */
async function copyModel(model, instance){
    let nModel = new instance(model.config);
    // action might be not required
    await nModel.buildModel(model.obs, model.action);
    const weights = model.model.weights;
    for (let m=0; m < weights.length; m++){
        await nModel.model.weights[m].val.assign(weights[m].val);
    }
    return nModel;
}

/**
 * Copy the value of of the model into the perturbedModel and
 * add a random pertubation
 * @param model Actor|Critic instance
 * @param perturbedActor Actor|Critic instance
 * @param stddev (number)
 * @return Copy of the model
 */
async function assignAndStd(model, perturbedModel, stddev, seed){
    const weights = model.model.trainableWeights;
    for (let m=0; m < weights.length; m++){
        let shape = perturbedModel.model.trainableWeights[m].val.shape;
        let randomTensor = await tf.randomNormal(shape, 0, stddev, "float32", seed);
        let nValue = await weights[m].val.add(randomTensor);
        await perturbedModel.model.trainableWeights[m].val.assign(nValue);
    }
}

/**
 * Update the target models
 * @param target Actor|Critic instance
 * @param perturbedActor Actor|Critic instance
 * @param config (Object)
 * @return Copy of the model
 */
async function targetUpdate(target, original, config){
    const originalW = original.model.trainableWeights;
    const targetW = target.model.trainableWeights;
    
    const one = tf.scalar(1);
    const tau = tf.scalar(config.tau);
    
    for (let m=0; m < originalW.length; m++){
        const lastValue = await target.model.trainableWeights[m].val.clone();
        let nValue = tau.mul(originalW[m].val).add(targetW[m].val.mul(one.sub(tau)));
        target.model.trainableWeights[m].val.assign(nValue);
        let buf = await lastValue.sub(target.model.trainableWeights[m].val).mean().buffer();
        const diff = buf.values;
        if (diff[0] == 0){
            console.warn("targetUpdate: Nothing have been changed!")
        }
    }
}


class Actor{

    /**
        @param config (Object)
     */
    constructor(config) {
        this.stateSize = config.stateSize;
        this.nbActions = config.nbActions;
        this.layerNorm = config.layerNorm;

        this.firstLayerSize = config.actorFirstLayerSize;
        this.secondLayerSize = config.actorSecondLayerSize;

        this.seed = config.seed;
        this.config = config;
        this.obs = null;
    }

    /**
     * 
     * @param obs tf.input
     */
    async buildModel(obs){
        this.obs = obs;

        // First layer
        this.firstLayer = tf.layers.dense({
            units: this.firstLayerSize,
            kernelInitializer: tf.initializers.glorotUniform({seed: this.seed}),
            activation: 'relu',
            useBias: true,
            biasInitializer: "zeros"
        });
        // Second layer
        this.secondLayer = tf.layers.dense({
            units: this.secondLayerSize,
            kernelInitializer: tf.initializers.glorotUniform({seed: this.seed}),
            activation: 'relu',
            useBias: true,
            biasInitializer: "zeros"
        });
        // Ouput layer
        this.outputLayer = tf.layers.dense({
            units: this.nbActions,
            kernelInitializer: tf.initializers.randomUniform({
                minval: 0.003, maxval: 0.003, seed: this.seed}),
            activation: 'tanh',
            useBias: true,
            biasInitializer: "zeros"
        });
        // Actor prediction
        this.predict = async (tfState) => {
            if (tfState){
                obs = tfState;
            }

            let l1 = await this.firstLayer.apply(obs);
            let l2 = await this.secondLayer.apply(l1);

            return await this.outputLayer.apply(l2);
        }
        const output = await this.predict();
        this.model = await tf.model({inputs: obs, outputs: output});
    }
}

class Critic {

    /**
     * @param config (Object)
     */
    constructor(config) {
        this.stateSize = config.stateSize;
        this.nbActions = config.nbActions;
        this.layerNorm = config.layerNorm;

        this.firstLayerSSize = config.criticFirstLayerSSize
        this.firstLayerASize = config.criticFirstLayerASize;
        this.secondLayerSize = config.criticSecondLayerSize;

        this.seed = config.seed;
        this.config = config;
        this.obs = null;
        this.action = null;
    }

    /**
     * 
     * @param obs tf.input
     * @param action tf.input
     */
    async buildModel(obs, action){
        this.obs = obs;
        this.action = action;

        // Used to merged the two first Layer later.
        this.add = tf.layers.add();

        // First layer
        this.firstLayerS = tf.layers.dense({
            units: this.firstLayerSSize,
            kernelInitializer: tf.initializers.glorotUniform({seed: this.seed}),
            activation: 'linear', // relu is add later
            useBias: true,
            biasInitializer: "zeros"
        });
        // First layer
        this.firstLayerA = tf.layers.dense({
            units: this.firstLayerASize,
            kernelInitializer: tf.initializers.glorotUniform({seed: this.seed}),
            activation: 'linear', // relu is add later
            useBias: true,
            biasInitializer: "zeros"
        });
        // Second layer
        this.secondLayer = tf.layers.dense({
            units: this.secondLayerSize,
            kernelInitializer: tf.initializers.glorotUniform({seed: this.seed}),
            activation: 'relu',
            useBias: true,
            biasInitializer: "zeros"
        });

        // Ouput layer
        this.outputLayer = tf.layers.dense({
            units: 1,
            kernelInitializer: tf.initializers.randomUniform({
                minval: 0.003, maxval: 0.003, seed: this.seed}),
            activation: 'linear',
            useBias: true,
            biasInitializer: "zeros"
        });
        
        // Critic prediction
        this.predict = async (tfState, tfActions) => {
            if (tfState && tfActions){
                obs = tfState;
                action = tfActions;
            }
                
            let l1A = await this.firstLayerA.apply(action);
            let l1S = await this.firstLayerS.apply(obs)
            
            // Merged layers
            let concat = await this.add.apply([l1A, l1S])
            let l2 = await this.secondLayer.apply(concat);   
            return await this.outputLayer.apply(l2);
        }

        const output = await this.predict();
        this.model = await tf.model({inputs: [obs, action], outputs: output});
    }
}

module.exports = {Actor, Critic, copyModel, assignAndStd, copyFromSave, targetUpdate}