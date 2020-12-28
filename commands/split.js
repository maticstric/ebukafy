/*
 * Split file at every <!--split--> into every chapter-n.xhtml, where
 * n is just an index starting at 1.
 */

const path = require('path');
const parseArgs = require('minimist');
const fs = require('fs');

const USAGE = 'usage: split [-h] target_file';
const SPLIT_TEXT = '<!--split-->';
const ERR_STRING = 'Error in \'split\':';

exports.execute = async (args) => {
  args = processArgs(args);

  let targetFile = args._[0];

  if (!targetFile) {
    usage();
  }

  return new Promise((resolve, reject) => {
    fs.readFile(targetFile, 'utf8', function(err, data) {
      if(err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        usage();
      }

      let chapters = data.split(SPLIT_TEXT);

      for (let i = 0; i < chapters.length; i++) {
        let chapterContent = chapters[i];
        let chapterName = 'chapter-' + (i + 1) + '.xhtml';
        let chapterPath = path.resolve(targetFile, '..', chapterName);

        fs.writeFile(chapterPath, chapterContent, 'utf8', function(err) {
            if(err) {
              console.error(`\n${ERR_STRING} ${err.message}`);
              usage();
            }
        });
      }

      resolve();
    });
  });
}

const processArgs = (args) => {
  args = parseArgs(args, {
    alias: {
      'help': 'h',
    },
    boolean: [
      'help'
    ],
  });

  if (args.help) {
    usage();
  }

  return args;
}

const usage = () => {
  console.error(USAGE);
  process.exit(1);
}
