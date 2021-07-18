const fs = require('fs');
const util = require('util');

const log = require('loglevel');

const DEFAULT_SOURCE_DIR = 'source';
const DEFAUL_DEST_DIR = 'dist';

const CLI_SOURCE_DIR_ARG = '--source';
const CLI_DIST_DIR_ARG = '--destination';

const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

exports.stat = stat;
exports.mkdir = mkdir;
exports.readdir = util.promisify(fs.readdir);

exports.last = (xs) => {
  if (!Array.isArray(xs)) {
    log.error('Incorrect type is provided. Array is expected!');
  }

  const len = xs.length;

  return xs[len - 1];
};

exports.mkDirIfNecessary = async (dirPath, cb) => {
  try {
    const nodeInfo = await stat(dirPath);

    if (!nodeInfo) {
      await mkdir(dirPath);
    }
  } catch (_) {
    cb();
  }
};

exports.extractCLIArgs = () => {
  const args = process.argv;

  const sourceDir =
    args[args.indexOf(CLI_SOURCE_DIR_ARG) + 1] || DEFAULT_SOURCE_DIR;

  const destinationDir =
    args[args.indexOf(CLI_DIST_DIR_ARG) + 1] || DEFAUL_DEST_DIR;

  return { sourceDir, destinationDir };
};
