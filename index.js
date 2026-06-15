/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('Hrms_', () => App);


// /**
//  * @format
//  */

// import { AppRegistry } from 'react-native';
// import { MMKV } from 'react-native-mmkv'; 

// // 🛡️ THE GLOBAL PROXY SAFETY NET
// // This intercepts ANY legacy static method called on the raw MMKV class name anywhere in the app
// const safetyInstance = new MMKV();

// const MMKVProxy = new Proxy(MMKV, {
//   get(target, prop) {
//     // If the property exists on the actual class definition, return it
//     if (prop in target) {
//       return target[prop];
//     }
//     // If a file attempts to call an instance method on the class name, redirect it to our safe instance!
//     if (typeof safetyInstance[prop] === 'function') {
//       return (...args) => safetyInstance[prop](...args);
//     }
//     return safetyInstance[prop];
//   }
// });

// // Bind the proxy to the global evaluation scope
// global.MMKV = MMKVProxy;

// // Import the loop-free default export from App.js
// import App from './App';

// // Single clean unified mount track point - matches your MainActivity.kt perfectly!
// AppRegistry.registerComponent('Hrms_', () => App);