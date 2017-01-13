import gulp from 'gulp';
import babel from 'gulp-babel';
import gulpif from 'gulp-if';
import uglify from 'gulp-uglify';
import del from 'del';
import concat from 'gulp-concat';
import sequence from 'run-sequence';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-minify-html';
import environments from 'gulp-environments';

const DIR_SRC = 'js/';
const DIR_BUILD = 'build/';
const DIR_DIST = 'dist/';

const isProduction = (environments.production)();

gulp.task('build', () => {
  return gulp.src(`./${DIR_SRC}/**/*`)
             .pipe(babel({presets: ['es2015']}))
             .pipe(gulp.dest(`./${DIR_BUILD}`));
});

gulp.task('concat', () => {
  return gulp.src(`./${DIR_BUILD}/**/*.js`)
             .pipe(concat('client.js'))
             .pipe(gulpif(isProduction, uglify()))
             .pipe(gulp.dest(`./${DIR_DIST}/js`));
});

gulp.task('copy:index', () => {
  return gulp.src('./index.html')
             .pipe(gulpif(isProduction, htmlmin()))
             .pipe(gulp.dest(`./${DIR_DIST}`));
});

gulp.task('copy:css', () => {
  return gulp.src('./css/**/*.css')
             .pipe(concat('main.css'))
             .pipe(gulpif(isProduction, cleanCSS()))
             .pipe(gulp.dest(`./${DIR_DIST}/css`));
});

gulp.task('copy:server', () => {
  return gulp.src([`./${DIR_BUILD}/constants/tile.js`, './server.js'])
             .pipe(concat('server.js'))
             .pipe(gulpif(isProduction, uglify()))
             .pipe(gulp.dest(`./${DIR_DIST}`));
});

gulp.task('copy', () => {
  sequence(
    'copy:index', 'copy:server', 'copy:css'
  );
});

gulp.task('clean', () => del([`./${DIR_BUILD}`, `./${DIR_DIST}`]) );

gulp.task('watch', () => {
  gulp.watch(`./${DIR_SRC}/**/*`, () => {
    sequence('build', 'concat');
  });
});

gulp.task('default', () => {
  sequence(
    'clean', 'build', 'concat', 'copy', 'watch'
  );
});

gulp.task('build:prod', () => {
  sequence(
    'clean', 'build', 'concat', 'copy'
  );
});