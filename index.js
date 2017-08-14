const requiredModules = require('./lib/required-modules');
const requireFromString = require('./lib/require-from-string');

/**
 * Eval loader
 *
 * @param {String} source
 * @return {String}
 */
function evalLoader(source) {
  // Evaluate raw JS
  const evaluatedModule = requireFromString(source, this.resourcePath);

  // Mark loader dependencies
  const self = this;
  requiredModules(evaluatedModule).forEach((dependency) => {
    self.addDependency(dependency);
    delete require.cache[dependency];
  });
  delete require.cache[require.resolve(this.resourcePath)];

  // Convert to JSON
  const evalExport = JSON.stringify(evaluatedModule.exports, null, 2);
  if (typeof evalExport === 'undefined') {
    throw new Error('JSON stringify error: module export could not be ' +
      'serialized. File: ' + this.resourcePath);
  }

  return 'module.exports = ' + evalExport + ';';
}

module.exports = evalLoader;
