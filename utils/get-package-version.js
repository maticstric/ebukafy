/*
 *  Gets the version of an npm package given the package.json file.
 */

const fs = require('fs');
const ERR_STRING = 'Error in \'get-package-version\' utility:';

exports.getPackageVersion = (packageJson) => {
  return new Promise((resolve, reject) => {
    fs.readFile(packageJson, 'utf8', function(err, data) {
      if(err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        process.exit(1);
      }

      let regex = /\"version\":\ \"(.*)\"/;
       
      let version = data.match(regex)[1]; // The [1] means the first capture group

      resolve(version);
    });
  });
}
