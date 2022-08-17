// Import Comp, Layer and Property constructors from package
import { Comp, Layer } from 'expression-globals-typescript';
// And values or functions from other files
import { fromOtherFile } from './otherFile';

// Creating new comp, layer and property objects from constructors
const thisComp = new Comp();
const thisLayer = new Layer();

function getLayerDuration(layerName: string) {
  const layer: Layer = thisComp.layer(layerName);
  return layer.outPoint - layer.inPoint;
}

function remap(value: number) {
  return thisLayer.linear(value, 0, 10, 0, 1);
}

function welcome(name: string): string {
  return `Welcome ${name}!`;
}

const someValue: number = 2;

// '_npmVersion' is replaced with value from package.json
// during compilation
const version: string = '_npmVersion';

// Export values to appear in jsx files
export { getLayerDuration, remap, welcome, someValue, version, fromOtherFile };
