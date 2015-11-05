'use strict';

var browserify = require('browserify');
// var shim = require('browserify-shim');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var es = require('event-stream')


var files = ['./src/*.js', './lib/*.js', './example/assets/*.js', 'gulpfile.js'];

gulp.task('xify', function () {
  var b = browserify({
    entries: './src/index.js',
    standalone: 'xify',
    debug: true
  });

  b.external(['jquery', 'history', 'urlinternal']);

  var bundle = b.bundle()

  var s1 = bundle
    .pipe(source('xify.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'));

  return s1;
});

gulp.task('xify-pack', function () {
  var b = browserify({
    entries: './src/index.js',
    standalone: 'xify',
    debug: true
  });

  b.external(['jquery']);
  
  var bundle = b.bundle()

  var s1 = bundle
    .pipe(source('xify.pack.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/'));

  var s2 = bundle
    .pipe(source('xify.pack.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest('./build/'));

  return es.merge(s1, s2);
});

/*gulp.task('umd-heavy', function () {
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

  b.external(['jquery', './lib/jquery.history.js', './lib/jquery.ba-urlinternal.js']);

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
});*/

gulp.task('example-bundle', function () {
  var b = browserify({
    entries: './example/assets/main_commonjs.js',
    debug: true
  });

  var bundle = b.bundle()

  var s1 = bundle
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./example/assets/'));

  return s1;
});

gulp.task('default', ['xify', 'xify-pack', 'example-bundle']);

gulp.task('watch', function () {
    gulp.watch(files, ['xify', 'xify-pack', 'example-bundle']);
});