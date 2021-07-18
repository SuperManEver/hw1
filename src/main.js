const path = require('path');
const fs = require('fs');
const log = require('loglevel');

const {
  last,
  mkDirIfNecessary,
  stat,
  mkdir,
  readdir,
  extractCLIArgs
} = require('./utils');

async function getAllPaths(dirPath, cb) {
  try {
    const files = await readdir(dirPath);

    files.forEach(async (file) => {
      const nodePath = path.join(dirPath, file);
      const nodeInfo = await stat(nodePath);

      if (nodeInfo.isFile()) {
        cb(nodePath);
      } else {
        getAllPaths(nodePath, cb);
      }
    });
  } catch (err) {
    log.error(
      'Error occurred on attempt to fetch files for path: ',
      dirPath,
      err
    );
  }
}

async function createDistDir(dirName) {
  const dirPath = path.join(process.cwd(), dirName);

  if (fs.existsSync(dirPath)) {
    return dirPath;
  }

  await mkdir(dirPath);

  return dirPath;
}

function copyFile(filePath, toDir) {
  const fileName = last(filePath.split('/'));
  const dirName = fileName[0].toUpperCase();

  if (!fileName || !toDir) return;

  const destDirPath = path.join(toDir, dirName);

  mkDirIfNecessary(destDirPath, () => {
    const destPath = path.normalize(path.join(destDirPath, fileName));

    fs.copyFile(filePath, destPath, (err) => {
      if (err) log.error(err);
    });
  });
}

async function main(arg) {
  const { sourceDir, destinationDir } = extractCLIArgs();

  const sourceDirPath = path.join(process.cwd(), sourceDir);

  try {
    await stat(sourceDirPath);

    const distDirPath = await createDistDir(destinationDir);

    getAllPaths(sourceDirPath, (filePath) => copyFile(filePath, distDirPath));
  } catch (err) {
    log.error("Provided directory doesn't exist!");
    process.exit(1);
  }
}

main();
