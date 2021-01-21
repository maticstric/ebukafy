/*
 *  Generates the toc for toc.xhtml and toc.ncx.
 */

const path = require('path');
const fs = require('fs');
const parseArgs = require('minimist');
const replaceInFile = require('../utils/replace-in-file').replaceInFile;
const arabicToRoman = require('../utils/arabic-to-roman').arabicToRoman;

const USAGE = 'usage: generate-toc [-hi] epub_directory';
const ERR_STRING = 'Error in \'generate-toc\':';

exports.execute = async (args) => {
  args = processArgs(args);

  let epubDirectory = args._[0];

  if (!epubDirectory) {
    usage();
  }

  let tocXhtml = await getTocXhtml(epubDirectory);
  //let tocNcx = await getTocNcx(epubDirectory);

  //if (args['in-place']) {
  //  inPlaceSpine(epubDirectory, spine);   
  //} else {
  //  console.log(spine);
  //}
  console.log(tocXhtml);
}

//const inPlaceSpine = (epubDirectory, spine) => {
//  let contentOpfPath = path.resolve(epubDirectory, 'EPUB', 'content.opf');
//
//  let spineRegex = /\s*<spine\ toc=\"ncx\">.*<\/spine>/s;
//
//  // Modify manifest so that the indentation works out in the content.opf
//  spine = '\n\t' + spine.split('\n').join('\n\t');
//
//  replaceInFile(contentOpfPath, [spineRegex], [spine]);
//}

const getTocXhtml = (epubDirectory) => {
  return new Promise((resolve, reject) => {
    let textPath = path.resolve(epubDirectory, 'EPUB', 'text');

    // For every file in the EPUB/text directory
    fs.readdir(textPath, function (err, files) {
      if (err) {
        console.error(`\n${ERR_STRING} ${err}`);
        usage();
      }

      let tocXhtml = [];

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        tocXhtml.push(
`\t<li>
\t\t<a href="text/${file}">${arabicToRoman(i + 1)}</a>
\t</li>`
        );
      }

      // Make string from array
      let tocXhtmlString = '<ol>\n';

      for (let i = 0; i < tocXhtml.length; i++) {
        let item = tocXhtml[i];

        tocXhtmlString += `${item}\n`;
      }

      tocXhtmlString += '</ol>';

      resolve(tocXhtmlString);
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
