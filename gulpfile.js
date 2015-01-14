var gulp = require('gulp');
var mocha = require('gulp-mocha');

var mochaOptions = {};

gulp.task('default', ['mocha']);
gulp.task('mocha', function () {
  return gulp.src([
    'spec/**/*.js'
  ])
    .pipe(mocha(mochaOptions));
});

gulp.task('watch', ['default'], function () {
  return gulp.watch([
    'spec/**/*.js',
    'index.js'
  ], ['default']);
});
