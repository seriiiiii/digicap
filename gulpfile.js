// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp');
const purgecss = require('gulp-purgecss'); // gulp-purgecss를 불러옵니다.
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');

// File paths
const files = {
  distPath: './dist',
  stylePath: './styles/**/*',
  htmlPath: './**/*.html',
  includePath: './include/**/*.html',
  jsDirPath: './js/**/*',
  jsFilePath: './js/**/*.js'
};

// Task to compile styles
function stylesTask() {
  return src(files.stylePath)
    .pipe(dest(files.distPath + '/styles'));
}

// Task to compile JavaScript files
function javascriptTask() {
  return src(files.jsDirPath)
    .pipe(dest(files.distPath + '/js'));
}

// Task to include HTML files
function fileincludeTask() {
  return src([files.htmlPath, '!./include/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest(files.distPath));
}

// Task to synchronize browser with changes and reload
function browserSyncTask() {
  var options = {
    server: {
      baseDir: files.distPath,
      directory: true
    },
    open: 'external'
  };
  browserSync.init(options);
  watch(files.htmlPath).on('change', browserSync.reload);
  watch(files.includePath).on('change', browserSync.reload);
  watch(files.jsFilePath).on('change', browserSync.reload);
  watch(files.stylePath).on('change', purgeCssTask); // CSS 파일 변경 감지 시 purgeCssTask 실행
}

// Task to remove unused CSS
function purgeCssTask() {
  return src(files.stylePath) // CSS 파일 대상으로 설정
    .pipe(purgecss({
      content: [files.htmlPath, files.includePath] // HTML 파일 경로 제공
    }))
    .pipe(dest(files.distPath + '/css')); // CSS 파일을 dist/css 디렉토리에 저장
}

// Export the purgeCssTask
exports.purgecss = purgeCssTask;

// Default task
exports.default = series(
  parallel(stylesTask, javascriptTask, fileincludeTask),
  series(browserSyncTask, purgeCssTask)
);
