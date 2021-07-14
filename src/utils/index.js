const fs = require('fs');

const log = require('loglevel');

exports.last = (xs) => {
  if (!Array.isArray(xs)) {
    log.error('Incorrect type is provided. Array is expected!');
  }

  const len = xs.length;

  return xs[len - 1];
};

exports.mkDirIfNecessary = (dirPath, cb) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdir(dirPath, (err) => {
      if (err) log.error(err);

      cb();
    });
  }

  cb();
};
