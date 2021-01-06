/*
 *  Generates the manifest part of the content.opf file.
 */

const path = require('path');
const fs = require('fs');
const parseArgs = require('minimist');
const replaceInFile = require('../utils/replace-in-file').replaceInFile;

const USAGE = 'usage: generate-manifest [-hi] epub_directory';
const ERR_STRING = 'Error in \'generate-manifest\':';

exports.execute = async (args) => {
  args = processArgs(args);

  let epubDirectory = args._[0];

  if (!epubDirectory) {
    usage();
  }

  let manifest = await getManifest(epubDirectory);

  if (args['in-place']) {
    inPlaceManifest(epubDirectory, manifest);   
  } else {
    console.log(manifest);
  }
}

const inPlaceManifest = async (epubDirectory, manifest) => {
  let contentOpfPath = path.resolve(epubDirectory, 'EPUB', 'content.opf');

  let manifestRegex = /\s*<manifest>.*<\/manifest>/s;

  // Modify manifest so that the indentation works out in the content.opf
  manifest = '\n\t' + manifest.split('\n').join('\n\t');

  replaceInFile(contentOpfPath, [manifestRegex], [manifest]);
}

const getManifest = async (epubDirectory) => {
  // XHTML files
  let textPath = path.resolve(epubDirectory, 'EPUB', 'text');
  let textManifest = await manifestDirectory(textPath, 'application/xhtml+xml')

  // CSS files
  let cssPath = path.resolve(epubDirectory, 'EPUB', 'css');
  let cssManifest = await manifestDirectory(cssPath, 'text/css')

  // JPG files
  let jpgPath = path.resolve(epubDirectory, 'EPUB', 'images');
  let jpgManifest = await manifestDirectory(jpgPath, 'image/jpeg')

  // TOC files
  let tocManifest = [];
  tocManifest.push(`<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>`);
  tocManifest.push(`<item href="toc.xhtml" id="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>`);

  let manifest = jpgManifest.concat(tocManifest).concat(cssManifest).concat(textManifest);
  let manifestString = '<manifest>\n';

  // Add all of the manifests into a string
  for (let i = 0; i < manifest.length; i++) {
    let item = manifest[i];

    let coverImageRegex = /id=\"cover\.jpg\"/;

    if (item.match(coverImageRegex)) { // If cover, add properties="cover-image"
      item = item.replace(`/>`, ` properties="cover-image"/>`);
    }

    manifestString += `\t${item}\n`;
  }

  manifestString += '</manifest>';

  return manifestString;
}

const manifestDirectory = (directory, mediaType) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, function (err, files) {
      if (err) {
        console.error(`\n${ERR_STRING} ${err}`);
        usage();
      }

      let manifest = [];

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let basename = path.basename(directory);

        manifest.push(`<item href="${basename}/${file}" id="${file}" media-type="${mediaType}"/>`);
      }

      resolve(manifest);
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
