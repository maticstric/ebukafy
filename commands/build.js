/*
 *  Builds the epub.
 */

const path = require('path');
const parseArgs = require('minimist');
const fs = require('fs');
const archiver = require('archiver');
const replaceInFile = require('../utils/replace-in-file').replaceInFile;

const USAGE = 'usage: build [-h] [-o output_file] epub_directory';
const ERR_STRING = 'Error in \'build\':';
const DEAFULT_OUTPUT_FILE = 'output.epub';

exports.execute = async (args) => {
  args = processArgs(args);

  let epubDirectory = args._[0];
  let outputFile;

  if (!epubDirectory) {
    usage();
  }

  if (args['output-file']) {
    outputFile = args['output-file'];
  } else { 
    outputFile = DEAFULT_OUTPUT_FILE;
  }

  await updateDateModified(epubDirectory);

  await zipEpub(epubDirectory, outputFile);
}

const zipEpub = async (epubDirectory, outputFile) => {
  //archive = setupArchiver(outputFile);

  let output = fs.createWriteStream(path.resolve(outputFile));
  let archive = archiver('zip', { zlib: { level: 0 }, store: true });

  archive.on('error', (err) => {
    console.error(`\n${ERR_STRING} ${err}`);
    usage();
  });

  archive.on('warning', (err) => {
    console.error(`\n${ERR_STRING} ${err}`);
    usage();
  });

  archive.pipe(output);

  // Add mimetype
  archive.file(path.resolve(epubDirectory,'mimetype'), { name: 'mimetype' });

  // Add META-INF and EPUB folders
  archive.directory(path.resolve(epubDirectory, 'META-INF'), 'META-INF');
  archive.directory(path.resolve(epubDirectory, 'EPUB'), 'EPUB');

  archive.finalize();
}

const updateDateModified = async (epubDirectory) => {
  let contentOpfPath = path.resolve(epubDirectory, 'EPUB', 'content.opf');
  let currentTime = new Date().toISOString();

  currentTime = currentTime.split('.')[0] + 'Z'; // epub doesn't like the ms

  let searchRegex = /<meta\ property=\"dcterms:modified\">.*<\/meta>/g;
  let replaceString = `<meta property="dcterms:modified">${currentTime}</meta>`;

  await replaceInFile(contentOpfPath, [searchRegex], [replaceString]);
}

const setupArchiver = (outputFile) => {
  let output = fs.createWriteStream(path.resolve(outputFile));
  let archive = archiver('zip', { store: true });

  archive.on('error', (err) => {
    console.error(`\n${ERR_STRING} ${err}`);
    usage();
  });

  archive.on('warning', (err) => {
    console.error(`\n${ERR_STRING} ${err}`);
    usage();
  });

  archive.pipe(output);

  return archive;
}

const processArgs = (args) => {
  args = parseArgs(args, {
    alias: {
      'help': 'h',
      'output-file': 'o'
    },
    boolean: [
      'help'
    ],
    string: [
      'output-file'
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
