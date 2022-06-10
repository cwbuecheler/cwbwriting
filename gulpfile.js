var gulp = require('gulp');
var concat = require('gulp-concat');
const terser = require('gulp-terser');

var paths = {
  scripts: {
    src: 'src/_js/global.js',
    dest: 'src/_js/',
  },
};

const scripts = () =>
  gulp
    .src(paths.scripts.src, { sourcemaps: true })
    .pipe(terser())
    .pipe(concat('global.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));

function watch() {
  gulp.watch(paths.scripts.src, scripts);
}

exports.scripts = scripts;
exports.watch = watch;

exports.default = watch;
