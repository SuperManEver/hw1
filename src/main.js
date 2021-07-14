const path = require('path');
const fs = require('fs');
const log = require('loglevel');
const { last, mkDirIfNecessary } = require('./utils');

const DEFAULT_SOURCE_DIR = 'source';
const DEFAUL_DEST_DIR = 'dist';

const CLI_SOURCE_DIR_ARG = '--source';
const CLI_DIST_DIR_ARG = '--destination';

function getAllPaths(dirPath, cb) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      cb(err, null);
    }

    files.forEach((file) => {
      const nodePath = path.join(dirPath, file);
      const nodeInfo = fs.statSync(nodePath);

      if (nodeInfo.isFile()) {
        cb(null, nodePath);
      } else {
        getAllPaths(nodePath, cb);
      }
    });
  });
}

function createDistDir(dirName, cb) {
  const dirPath = path.join(process.cwd(), dirName);

  if (fs.existsSync(dirPath)) {
    cb(dirPath);
    return;
  }

  fs.mkdir(dirPath, (err) => {
    if (err) {
      log.error(err);
    }

    cb(dirPath);
  });
}

function copyFile(filePath, toDir) {
  const fileName = last(filePath.split('/'));
  const dirName = fileName[0].toUpperCase();
  const destDirPath = path.join(toDir, dirName);

  mkDirIfNecessary(destDirPath, () => {
    const destPath = path.normalize(path.join(destDirPath, fileName));

    fs.copyFile(filePath, destPath, (err) => {
      if (err) log.error(err);
    });
  });
}

function extractCLIArgs() {
  const args = process.argv;

  const sourceDir =
    args[args.indexOf(CLI_SOURCE_DIR_ARG) + 1] || DEFAULT_SOURCE_DIR;

  const destinationDir =
    args[args.indexOf(CLI_DIST_DIR_ARG) + 1] || DEFAUL_DEST_DIR;

  return { sourceDir, destinationDir };
}

function main(arg) {
  const { sourceDir, destinationDir } = extractCLIArgs();

  const sourceDirPath = path.join(process.cwd(), sourceDir);

  fs.stat(sourceDirPath, (err) => {
    if (err) {
      log.error("Provided directory doesn't exist!");
      process.exit(1);
    }

    createDistDir(destinationDir, (distDirPath) => {
      getAllPaths(sourceDirPath, (err, filePath) => {
        if (err) {
          log.error(err);
        }

        copyFile(filePath, distDirPath);
      });
    });
  });
}

main();
