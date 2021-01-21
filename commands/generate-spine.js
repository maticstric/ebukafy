/*
 *  Generates the spine part of the content.opf file.
 */

const path = require('path');
const fs = require('fs');
const parseArgs = require('minimist');
const replaceInFile = require('../utils/replace-in-file').replaceInFile;

const USAGE = 'usage: generate-spine [-hi] epub_directory';
const ERR_STRING = 'Error in \'generate-spine\':';

exports.execute = async (args) => {
  args = processArgs(args);

  let epubDirectory = args._[0];

  if (!epubDirectory) {
    usage();
  }

  let spine = await getSpine(epubDirectory);

  if (args['in-place']) {
    inPlaceSpine(epubDirectory, spine);   
  } else {
    console.log(spine);
  }
}

const inPlaceSpine = (epubDirectory, spine) => {
  let contentOpfPath = path.resolve(epubDirectory, 'EPUB', 'content.opf');

  let spineRegex = /\s*<spine\ toc=\"ncx\">.*<\/spine>/s;

  // Modify manifest so that the indentation works out in the content.opf
  spine = '\n\t' + spine.split('\n').join('\n\t');

  replaceInFile(contentOpfPath, [spineRegex], [spine]);
}

const getSpine = (epubDirectory) => {
  return new Promise((resolve, reject) => {
    let textPath = path.resolve(epubDirectory, 'EPUB', 'text');

    // For every file in the EPUB/text directory
    fs.readdir(textPath, function (err, files) {
      if (err) {
        console.error(`\n${ERR_STRING} ${err}`);
        usage();
      }

      let spine = [];

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        spine.push(`<itemref idref="${file}"/>`);
      }

      // Make string from array
      let spineString = '<spine toc="ncx">\n';

      for (let i = 0; i < spine.length; i++) {
        let item = spine[i];

        spineString += `\t${item}\n`;
      }

      spineString += '</spine>';

      resolve(spineString);
    });
  });
}

const processArgs = (args) => {
  args = parseArgs(args, {
    alias: {
      'help': 'h',
      'in-place': 'i'
    },
    boolean: [
      'help',
      'in-place'
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
