#!/usr/bin/env node

const parseArgs = require('minimist');
const path = require('path');
const commands = require('./commands');
const getPackageVersion = require('./utils/get-package-version').getPackageVersion;

const USAGE = 'usage: ebukafy [-hv] command [args ...]';

const main = async () => {
  let args = await processArgs();

  let command = args._[0];

  if (command) {
    await executeCommand(command, args._.slice(1));
  }
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
  } else if (command === 'generate-manifest') {
    await commands.generateManifest(args);
  } else if (command === 'generate-spine') {
    await commands.generateSpine(args);
  } else if (command === 'smarten-quotes') {
    await commands.smartenQuotes(args);
  } else {
    console.error(`No such command: '${command}'.`);
    usage();
  }
}

const processArgs = async () => {
  let args = process.argv.slice(2);

  args = parseArgs(args, {
    alias: {
      'help': 'h',
      'version': 'v'
    },
    boolean: [
      'help',
      'version'
    ],
    stopEarly: true // Stops at first non-option. Puts the rest into ._
  });

  if (args.version) {
    let version = await getPackageVersion(path.resolve(__dirname, 'package.json'));

    console.log(version);
  }

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

