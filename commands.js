/*
 *  Exports all the different commands available.
 */

const createSkeleton = require('./commands/create-skeleton');
const split = require('./commands/split');
const build = require('./commands/build');
const epubcheck = require('./commands/epubcheck');
const generateManifest = require('./commands/generate-manifest');
const generateSpine = require('./commands/generate-spine');

exports.createSkeleton = async (args) => { 
  await createSkeleton.execute(args);
};

exports.split = async (args) => { 
  await split.execute(args);
};

exports.build = async (args) => { 
  await build.execute(args);
};

exports.epubcheck = async (args) => { 
  await epubcheck.execute(args);
};

exports.generateManifest = async (args) => { 
  await generateManifest.execute(args);
};

exports.generateSpine = async (args) => { 
  await generateSpine.execute(args);
};
