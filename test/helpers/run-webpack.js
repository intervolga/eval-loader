const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const generateConfig = require('./generate-config');

module.exports = (entry) => {
  const config = generateConfig(entry);
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      const we = err ||
        (stats.hasErrors() && stats.compilation.errors[0]) ||
        (stats.hasWarnings() && stats.compilation.warnings[0]);

      if (we) {
        reject(we);
        return;
      }

      try {
        const bundlePath = path.join(
            config.output.path, config.output.filename);
        const result = require(bundlePath);

        const resultPath = path.join(config.output.path, 'produced.json');
        fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });
};
