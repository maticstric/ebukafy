/*
 *  Simplest possible conversion from straight quotes to curly quotes.
 *  Specifically, this looks between all <p> tags and does a very simple
 *  check for whether it should be an openning or closing quote.
 *  Definitely doesn't work for apostrophes.
 */

const fs = require('fs');
const parseArgs = require('minimist');
const path = require('path');
const smartquotes = require('smartquotes');

const replaceInFile = require('../utils/replace-in-file').replaceInFile;

const USAGE = 'usage: smarten-quotes [-h] target_file ...';
const ERR_STRING = 'Error in \'smarten-quotes\':';

exports.execute = async (args) => {
  args = processArgs(args);

  let targetFiles = args._;

  if (!targetFiles) {
    usage();
  }

  for (let i = 0; i < targetFiles.length; i++) {
    targetFile = targetFiles[i];

    smartenQuotes(targetFile);
  }
}

const smartenQuotes = (targetFile) => {
  return new Promise((resolve, reject) => {
    fs.readFile(targetFile, 'utf8', function(err, data) {
      if (err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        usage();
      }

      let regexInsidePTag = /<p>(.*)<\/p>/g;
      let oldParagraphs = Array.from(data.matchAll(regexInsidePTag));
      oldParagraphs = oldParagraphs.map((p, i) => oldParagraphs[i][1]);

      let newParagraphs = [];

      for (let i = 0; i < oldParagraphs.length; i++) {
        newParagraphs[i] = smartquotes.string(oldParagraphs[i]);
      }

      replaceInFile(targetFile, oldParagraphs, newParagraphs).then(() => {
        resolve();
      });
    });
  });
}

const processArgs = (args) => {
  args = parseArgs(args, {
    alias: {
      'help': 'h'
    },
    boolean: [
      'help'
    ]
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
