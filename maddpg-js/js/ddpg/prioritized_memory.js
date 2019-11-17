
class PrioritizedMemory {

    /**
     * @param maxlen (number) Buffer limit
     */
    constructor(maxlen){
        this.maxlen = maxlen;
        this.buffer = [];
        this.priorBuffer = [];
    }

    /**
     * Sample a batch
     * @param batchSize (number)
     * @return batch []
     */
    async getBatch(batchSize){
        const batch =  {
            'obs0': [],
            'obs1': [],
            'rewards': [],
            'actions': [],
            'terminals': [],
        };

        if (batchSize > this.priorBuffer.length){
            console.warn("The size of the replay buffer is < to the batchSize. Return empty batch.");
            return batch;
        }

        for (let b=0; b < batchSize/2; b++){
            let id = Math.floor(Math.random() * this.priorBuffer.length);
            await batch.obs0.push(this.priorBuffer[id].obs0);
            await batch.obs1.push(this.priorBuffer[id].obs1);
            await batch.rewards.push(this.priorBuffer[id].reward);
            await batch.actions.push(this.priorBuffer[id].action);
            await batch.terminals.push(this.priorBuffer[id].terminal);
        }
        return batch
    }

    async _bufferBatch(batchSize){
        const batch =  {
            'obs0': [],
            'obs1': [],
            'rewards': [],
            'actions': [],
            'terminals': [],
        };

        for (let b=0; b < batchSize/2; b++){
            let nElem = this.buffer.pop();
            await batch.obs0.push(nElem.obs0);
            await batch.obs1.push(nElem.obs1);
            await batch.rewards.push(nElem.reward);
            await batch.actions.push(nElem.action);
            await batch.terminals.push(nElem.terminal);
        }

        for (let b=0; b < batchSize/2; b++){
            let id = Math.floor(Math.random() * this.buffer.length);
            await batch.obs0.push(this.buffer[id].obs0);
            await batch.obs1.push(this.buffer[id].obs1);
            await batch.rewards.push(this.buffer[id].reward);
            await batch.actions.push(this.buffer[id].action);
            await batch.terminals.push(this.buffer[id].terminal);
            await this.buffer.splice(id, 1);
        }

        return batch
    }

    async _addRandomBufferBatch(batchSize, batch){
        for (let b=0; b < batchSize; b++){
            let id = Math.floor(Math.random() * this.buffer.length);
            await batch.obs0.push(this.buffer[id].obs0);
            await batch.obs1.push(this.buffer[id].obs1);
            await batch.rewards.push(this.buffer[id].reward);
            await batch.actions.push(this.buffer[id].action);
            await batch.terminals.push(this.buffer[id].terminal);
            await this.buffer.splice(id, 1);
        }
        return batch
    }

    /**
     * Sample a batch
     * @param batchSize (number)
     * @return batch []
     */
    async popBatch(batchSize){
        let originalBatchSize = batchSize;
        if (batchSize % 2 != 0){
            console.warn("Batch size should be a even.")
        }
        if (this.priorBuffer.length < batchSize/2){
            const batch = await this._bufferBatch(batchSize);
            console.assert(batch.obs0.length == batchSize);
            return batch;
        }
        const batch =  {
            'obs0': [],
            'obs1': [],
            'rewards': [],
            'actions': [],
            'terminals': [],
        };
        if (batchSize > this.length){
            console.warn("The size of the replay buffer is < to the batchSize. Return empty batch.");
            return batch;
        }

        if (this.buffer.length > 0){
            //console.log("Get half of prior and other from buffer.");
            batchSize = batchSize / 2;
        }
        else{
            //console.log("Get all from priorBuffer");
        }

        for (let b=0; b < batchSize; b++){
            let id = await Math.floor(Math.random() * this.priorBuffer.length);
            await batch.obs0.push(this.priorBuffer[id].obs0);
            await batch.obs1.push(this.priorBuffer[id].obs1);
            await batch.rewards.push(this.priorBuffer[id].reward);
            await batch.actions.push(this.priorBuffer[id].action);
            await batch.terminals.push(this.priorBuffer[id].terminal);
            await this.priorBuffer.splice(id, 1);
        }

        if (this.buffer.length > 0){
            await this._addRandomBufferBatch(batchSize, batch);
        }
        console.assert(batch.obs0.length == originalBatchSize);
        return batch
    }

    async _insert(element, array) {
        if (array.length == 0 || element.cost < array[0].cost || array[0].cost == null){
            await array.unshift(element);
            return array;
        }
        await array.splice(this._locationOf(element, array) + 1, 0, element);
        return array;
    }
    
    async _locationOf(element, array, start, end) {
        start = start || 0;
        end = end || array.length;
    
        var pivot = parseInt(start + (end - start) / 2, 10);
    
        if (end-start <= 1 || array[pivot] === element) return pivot;
    
        if (array[pivot].cost != null && array[pivot].cost < element.cost) {
            return await this._locationOf(element, array, pivot, end);
        } else {
            return await this._locationOf(element, array, start, pivot);
        }
    }

    /**
     * @param batch (Object)  from getBatch() 
     * @param cost (number) Cost associated with each row of the batch
     */
    async appendBackWithCost(batch, costs){
        for (let b=0; b < batch.obs0.length; b++){
            if (this.buffer.length == this.maxlen){
                await this.buffer.shift();
            }
            await this._insert({
                obs0: batch.obs0[b],
                action: batch.actions[b],
                reward: batch.rewards[b],
                obs1: batch.obs1[b],
                terminal: batch.terminals[b],
                cost: costs[b]
            }, this.buffer);
        }
        console.assert(this.buffer.length <= this.maxlen);
    }

    /**
     * @param obs0 []
     * @param action (number)
     * @param reward (number)
     * @param obs1 []
     * @param terminal1 (boolean)
     */
    async append(obs0, action, reward, obs1, terminal){
        if (this.priorBuffer.length == this.maxlen){
            await this.priorBuffer.shift();
        }
        await this.priorBuffer.push({
            obs0: obs0,
            action: action,
            reward: reward,
            obs1: obs1,
            terminal: terminal,
            cost: null
        });
        console.assert(this.priorBuffer.length <= this.maxlen);
    }
}

module.exports = PrioritizedMemory;