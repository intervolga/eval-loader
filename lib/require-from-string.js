const NativeModule = require('module');
const path = require('path');

/**
 * Compile module from source code provided as string
 *
 * @param {String} sourceCode
 * @param {String} fileName
 * @return {Module}
 */
function requireFromString(sourceCode, fileName) {
  const modulePath = path.dirname(fileName);
  const evaluatedModule = new NativeModule(fileName);
  evaluatedModule.paths = NativeModule._nodeModulePaths(modulePath);
  evaluatedModule.filename = fileName;
  evaluatedModule._compile(sourceCode, fileName);

  // Alternative, with possible side effect (parallel execution)
  //
  // const prevRequireCache = Object.keys(require.cache);
  //
  // ...
  //
  // Object.keys(require.cache).filter((key) => {
  //   return prevRequireCache.indexOf(key) < 0;
  // }).forEach((key) => {
  //   delete require.cache[key];
  // });

  return evaluatedModule;
}

module.exports = requireFromString;
