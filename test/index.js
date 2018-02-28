const expect = require('expect.js');
const fse = require('fs-extra');
const path = require('path');
const runWebpack = require('./helpers/run-webpack');
const watchWebpack = require('./helpers/watch-webpack');

describe('eval loader', () => {
  it('should pass normal js module', () => {
    const paths = getCasePaths('normal');

    return runWebpack(paths.source).then((result) => {
      expect(result).to.eql(require(paths.expected));
    });
  });

  it('should pass normal js module with requires', () => {
    const paths = getCasePaths('with-requires');

    return runWebpack(paths.source).then((result) => {
      expect(result).to.eql(require(paths.expected));
    });
  });

  it('should rebuild when requires changed', function(done) {
    this.timeout(30000); // eslint-disable-line no-invalid-this

    const paths = getCasePaths('requires-changed');
    const source = path.join(paths.path, 'source_incl_2.js');
    const original = path.join(paths.path, 'source_incl_2_original.js');
    const changed = path.join(paths.path, 'source_incl_2_changed.js');

    fse.copySync(original, source);

    let firstRun = false;
    let firstTimerId = null;
    let watching;
    const cb = (result) => {
      expect(typeof result).to.be.a('string');

      if (!firstRun) {
        if (firstTimerId) {
          clearTimeout(firstTimerId);
        }

        firstTimerId = setTimeout(() => {
          firstRun = true;
          fse.copySync(changed, source);
        }, 5000);
      } else {
        setTimeout(() => {
          expect(result).to.eql(require(paths.expected));
          done();
          watching && watching.close();
        }, 5000);
      }
    };

    watching = watchWebpack(paths.source, cb);
  });

  it('should produce readable syntax errors', () => {
    const paths = getCasePaths('with-error');

    return runWebpack(paths.source).then(() => {
      // This test case should not be success
      expect().fail();
    }).catch((err) => {
      let message = err.toString();
      expect(message).to.contain('Module build failed');
      expect(message).to.contain('source.js:7');
      expect(message).to.contain('elemMods: {m1');
    });
  });

  it('should produce error with bad export', () => {
    const paths = getCasePaths('wrong-export');

    return runWebpack(paths.source).then(() => {
      // This test case should not be success
      expect().fail();
    }).catch((err) => {
      let message = err.toString();
      expect(message).to.contain('JSON stringify error');
      expect(message).to.contain('wrong-export/source.js');
    });
  });

  it('should be fast', () => {
    const paths = getCasePaths('speedtest');

    const start = process.hrtime();
    return runWebpack(paths.source).then(() => {
      const elapsed = process.hrtime(start);

      expect(elapsed).to.be.an('array');
      expect(elapsed[0]).to.be(0);

      // most time used for webpack initialization
      expect(elapsed[1] / 1000000).to.be.below(200);
    });
  });
});

/**
 * Generate paths to source and expected files
 *
 * @param {String} caseName
 * @return {{source: *, expected: *}}
 */
function getCasePaths(caseName) {
  return {
    'path': path.join(__dirname, 'cases', caseName),
    'source': path.join(__dirname, 'cases', caseName,
      'source.js'),
    'expected': path.join(__dirname, 'cases', caseName,
      'expected.json'),
  };
}
