/*
 *  Replace any string within a file. Input search and replace values
 *  as an array so you can do multiple with one call.
 */

const fs = require('fs');
const ERR_STRING = 'Error in \'replace-in-file\' utility:';

exports.replaceInFile = (targetFile, searchArray, replaceArray) => {
  return new Promise((resolve, reject) => {
    fs.readFile(targetFile, 'utf8', function(err, data) {
      if(err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        process.exit(1);
      }
       
      for(let i = 0; i < searchArray.length; i++) {
        let search = searchArray[i];
        let replace = replaceArray[i];

        data = data.replace(search, replace);
      }

      fs.writeFile(targetFile, data, 'utf8', function(err) {
          if(err) {
            console.error(`\n${ERR_STRING} ${err.message}`);
            process.exit(1);
          }

          resolve();
      });
    });
  });
}
