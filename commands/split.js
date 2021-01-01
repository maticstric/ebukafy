/*
 * Split file at every '<!--split-->' into every chapter-n.xhtml, where
 * n is just an index starting at 1.
 */

const path = require('path');
const parseArgs = require('minimist');
const fs = require('fs');
const arabicToRoman = require('../utils/arabic-to-roman').arabicToRoman;

const USAGE = 'usage: split [-h] target_file';
const SPLIT_TEXT = '<!--split-->';
const ERR_STRING = 'Error in \'split\':';

let chapterTemplate =
`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>ROMAN</title>
    <link href="../css/ebuk.css" rel="stylesheet" type="text/css"/>
  </head>
  <body epub:type="bodymatter">
    <section id="chapter-ARABIC" epub:type="chapter">
      <h2 epub:type="ordinal">ROMAN</h2>
TEXT
    </section>
  </body>
</html>`;

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
        let chapterContent = chapterTemplate.replace('TEXT', chapters[i].trim());
        chapterContent = chapterContent.replace(/ARABIC/g, i + 1);
        chapterContent = chapterContent.replace(/ROMAN/g, arabicToRoman(i + 1));

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
