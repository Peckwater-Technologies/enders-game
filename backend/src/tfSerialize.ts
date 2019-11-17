import * as tf from "@tensorflow/tfjs";

export async function modelToJson(model: tf.Sequential): Promise<string> {
  let res: string = null;
  await model.save(tf.io.withSaveHandler(async (artifacts: tf.io.ModelArtifacts) => {
    res = artifactsToJSON(artifacts);
    return null;
  }));
  if (res === null) {
    // tslint:disable-next-line: no-console
    console.warn("WARNING: Model didn't export!");
  }
  return res;
}

// Random token to signify string is array buffer
const arrayBuffToken = "%%ab%%";

function artifactsToJSON(artifacts: tf.io.ModelArtifacts) {
  function replacer(key: any, value: any) {
    if (value instanceof ArrayBuffer) {
      return arrayBuffToken + ab2str(value);
    }
    return value;
  }
  return JSON.stringify(artifacts, replacer);
}

export function jsonToModel(json: string): Promise<tf.LayersModel> {
  const artifacts = jsonToArtifacts(json);
  return tf.loadLayersModel(tf.io.fromMemory(artifacts));
}

function jsonToArtifacts(json: string): tf.io.ModelArtifacts {
  function reviver(key: any, value: any) {
    if (typeof value === "string" && value.startsWith(arrayBuffToken)) {
      return str2ab(value.substring(arrayBuffToken.length));
    }
    return value;
  }
  return JSON.parse(json, reviver);
}

function ab2str(buf: ArrayBuffer): string {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
