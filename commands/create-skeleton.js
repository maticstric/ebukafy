/*
 * Creates a skeleton of an epub directory.
 */

const path = require('path');
const childProcess = require('child_process');
const parseArgs = require('minimist');
const generateUID = require('../utils/generate-uid').generateUID;
const replaceInFile = require('../utils/replace-in-file').replaceInFile;

const USAGE = 'usage: create-skeleton [-h] [-u uid] [-a author] -l language -t title target_directory';
const ERR_STRING = 'Error in \'create-skeleton\':';

const UID_LENGTH = 32;

exports.execute = async (args) => {
  args = processArgs(args);

  let targetDirectory = args._[0];

  if (!targetDirectory) {
    usage();
  }

  let author = args.author;
  let title = args.title;
  let language = args.language;
  let uid = args.uid;

  await copySkeleton(targetDirectory);
  await replaceInSkeleton(targetDirectory, author, title, language, uid);
}

const replaceInSkeleton = async (targetDirectory, author, title, language, uid) => {
  /*
   *  Replaces the TITLE, LANGUAGE, and UID variables in the 
   *  skeleton files.
   */

  let EPUBPath = path.resolve(targetDirectory, 'skeleton', 'EPUB');

  let contentOpfPath = path.resolve(EPUBPath, 'content.opf');
  let tocNcxPath = path.resolve(EPUBPath, 'toc.ncx');
  let tocXhtmlPath = path.resolve(EPUBPath, 'toc.xhtml');
  let chapterPath = path.resolve(EPUBPath, 'text', 'chapter-1.xhtml');

  if (!uid) { // If no UID supplied, generate random
    uid = generateUID(UID_LENGTH);
  }

  if (!author) { // If no author supplied, delete the dc:creator tag
    await replaceInFile(contentOpfPath, 
                          [/<dc:creator>AUTHOR<\/dc:creator>\r?\n\s*/g],
                          ['']);
  }

  await replaceInFile(contentOpfPath, 
                        [/AUTHOR/g, /TITLE/g, /LANGUAGE/g, /UID/g],
                        [author, title, language, uid]);

  await replaceInFile(tocNcxPath, [/UID/g], [uid]);
}

const copySkeleton = (targetDirectory) => {
  /*
   *  Copies over the skeleton to the targetDirectory.
   */

  return new Promise((resolve, reject) => {
    let skeletonDir = path.resolve(__dirname, '../skeleton');
    let cp = childProcess.spawn('cp', ['-r', skeletonDir, targetDirectory]);

    cp.stderr.on('data', (data) => {
      // 'data' is a buffer so we convert to a string
      let errorMessage = data.toString('utf-8');
      console.error(`\n${ERR_STRING} ${errorMessage}`);

      usage();
    });

    cp.on('close', () => {
      resolve();
    });
  });
}

const processArgs = (args) => {
  args = parseArgs(args, {
    alias: {
      'help': 'h',
      'author': 'a',
      'title': 't',
      'language': 'l',
      'uid': 'u'
    },
    boolean: [
      'help'
    ],
    string: [
      'author',
      'title',
      'language',
      'uid'
    ]
  });

  if (args.help || !args.title || !args.language) {
    usage();
  }

  return args;
}

const usage = () => {
  console.error(USAGE);
  process.exit(1);
}
