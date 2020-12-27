/*
 *  Exports all the different commands available.
 */

const createSkeleton = require('./commands/create-skeleton');

exports.createSkeleton = async (args) => { 
  await createSkeleton.execute(args);
};
