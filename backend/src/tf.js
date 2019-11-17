import * as tf from "@tensorflow/tfjs";
import { REPL_MODE_SLOPPY } from "repl";

const hiddenLayers = [
  40
];

function makeModel(inputCount, outputCount) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: hiddenLayers[0], activation: 'relu', kernelInitializer: 'randomNormal', inputShape: [ 10 ] }));
  for (let i = 1; i < hiddenLayers.length; i++) {
    model.add(tf.layers.dense({ units: hiddenLayers[i], activation: 'relu' }))
  }
  model.add(tf.layers.dense({ units: outputCount, activation: 'softmax', kernelInitializer: 'randomNormal' }));
  return model;
}

(async function main() {
  const model = makeModel(10, 10);
  model.
})();

/*
  await model.save(tf.io.withSaveHandler(artifacts => {
    console.log(JSON.stringify(artifacts));
    console.log(artifacts.weightData);
    console.log(artifacts.weightData instanceof ArrayBuffer);
  }));
*/

// Random token to signify string is array buffer
const arrayBuffToken = "%%ab%%";

function artifactsToJSON(artifacts) {
  artifacts.weightData = ab2str(artifacts.weightData);
  function replacer(key, value) {
    if (value instanceof ArrayBuffer) {
      return arrayBuffToken+ab2str(value);
    }
    return value;
  }
  return JSON.stringify(artifacts, replacer);
}

function jsonToArtifacts(json) {
  function reviver(key, value) {
    if (typeof value === "string" && value.startsWith(arrayBuffToken)) {
      return str2ab(value.substring(arrayBuffToken.length));
    }
    return value;
  }
  return JSON.parse(json, reviver);
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}