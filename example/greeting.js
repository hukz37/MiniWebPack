import { name } from './name.js';
import { capitalize } from './helpers/capitalize.js';

export function greet() {
  console.log(`Hello, ${capitalize(name)}!`);
}