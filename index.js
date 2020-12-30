#!/usr/bin/env node

const parseArgs = require('minimist');
const path = require('path');
const commands = require('./commands');

const USAGE = 'usage: ebukafy [-h] command [args ...]';

const ROOT_DIR = path.dirname(require.main.filename);
exports.ROOT_DIR = ROOT_DIR;

const main = async () => {
  let args = processArgs();

  let command = args._[0];

  await executeCommand(command, args._.slice(1));
}

const executeCommand = async (command, args) => {
  if (command === 'create-skeleton') {
    await commands.createSkeleton(args);
  } else if (command === 'split') {
    await commands.split(args);
  } else if (command === 'build') {
    await commands.build(args);
  } else if (command === 'epubcheck') {
    await commands.epubcheck(args);
  }
}

const processArgs = () => {
  let args = process.argv.slice(2);

  args = parseArgs(args, {
    alias: {
      'help': 'h'
    },
    boolean: [
      'help'
    ],
    stopEarly: true // Stops at first non-option. Puts the rest into ._
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

main();

