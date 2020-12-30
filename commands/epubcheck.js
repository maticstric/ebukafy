/*
 *  Runs the epubcheck utility. Note that you need java to run this.
 *  https://github.com/w3c/epubcheck
 */

const path = require('path');
const childProcess = require('child_process');
const parseArgs = require('minimist');

const USAGE = 'usage: epubcheck [-h] target_epub';
const ERR_STRING = 'Error in \'epubcheck\':';
const EPUBCHECK = path.resolve(__dirname, '../utils', 'epubcheck-4.2.4', 'epubcheck.jar');

exports.execute = async (args) => {
  args = processArgs(args);

  let targetEpub = args._[0];

  if (!targetEpub) {
    usage();
  }

  await runEpubcheck(targetEpub);
}

const runEpubcheck = (targetEpub) => {
  return new Promise((resolve, reject) => {
    let epubcheck = childProcess.spawn('java', ['-jar', EPUBCHECK, targetEpub]);

    epubcheck.stdout.on('data', (data) => {
      let epubcheckMessage = data.toString('utf-8');
      console.log(epubcheckMessage);
    });

    epubcheck.stderr.on('data', (data) => {
      // 'data' is a buffer so we convert to a string
      let errorMessage = data.toString('utf-8');
      console.error(`\n${ERR_STRING} ${errorMessage}`);

      usage();
    });

    epubcheck.on('close', () => {
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
