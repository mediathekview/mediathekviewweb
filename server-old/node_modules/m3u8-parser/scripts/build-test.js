import browserify from 'browserify';
import fs from 'fs';
import glob from 'glob';
import exportM3u8s from './export-m3u8s';

// build modules for the test m3u8s
exportM3u8s.build();

glob('test/**/*.test.js', (err, files) => {
  if (err) {
    throw err;
  }
  browserify(files)
    .transform('babelify')
    .transform('browserify-shim', {global: true})
    .bundle()
    .pipe(fs.createWriteStream('test/dist/bundle.js'));
});
