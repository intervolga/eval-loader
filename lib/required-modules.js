/**
 * Generate list of modules required by parentModule
 *
 * @param {Object} parentModule
 * @return {Array}
 */
function requiredModules(parentModule) {
  let required = [];

  parentModule.children.forEach((childModule) => {
    required = required.concat(requiredModules(childModule));
    required.push(childModule.filename);
  });

  return required;
}

module.exports = requiredModules;
