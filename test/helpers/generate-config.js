const path = require('path');
const loader = path.join(__dirname, '..', '..', 'index.js');

module.exports = function(entry) {
  return {
    mode: 'development',
    entry: entry,

    output: {
      path: path.dirname(entry),
      filename: 'produced.bundle.js',
      libraryTarget: 'commonjs2',
    },

    module: {
      rules: [{
        test: /\.js$/,
        use: {loader: loader},
      }],
    },

    target: 'node',
  };
};
