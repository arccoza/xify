'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var es = require('event-stream')


gulp.task('umd-heavy', function () {
  var b = browserify({
    entries: './index.js',
    standalone: 'xify',
    debug: true
  });

  var bundle = b.bundle()

  var s1 = bundle
    .pipe(source('xify.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'));

  var s2 = bundle
    .pipe(source('xify.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest('./build/'));

  return es.merge(s1, s2);
});

gulp.task('umd-lite', function () {
  var b = browserify({
    entries: './index.js',
    standalone: 'xify',
    debug: true
  });

  b.external(['jquery']);

  var bundle = b.bundle()

  var s1 = bundle
    .pipe(source('xify.lite.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'));

  var s2 = bundle
    .pipe(source('xify.lite.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest('./build/'));

  return es.merge(s1, s2);
});

gulp.task('browser-heavy-min', function () {
  var b = browserify({
    entries: './index.js',
    standalone: 'xify',
    debug: true
  });

  return b.bundle()
    .pipe(source('xify.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['umd-heavy', 'umd-lite']);