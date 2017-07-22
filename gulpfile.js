const gulp = require('gulp');
const del = require('del');
const minify = require('gulp-minify');
// const sourcemaps = require('gulp-sourcemaps');
// const mocha = require('gulp-mocha');

gulp.task('default', ['clean'], () => {
  return gulp.src('lib/validate.js')
    .pipe(minify({
      ext: {
        src: '.js',
        min: '.min.js'
      }
    }))
   .pipe(gulp.dest('dist'))
   .pipe(gulp.dest('example/dist'));
});

gulp.task('test', () => {
  // todo
});

gulp.task('clean', () => {
  return del([
    'dist',
    'example/dist'
  ]);
});
