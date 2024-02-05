const { src, dest, watch, series, parallel } = require("gulp");
const purgecss = require("gulp-purgecss"); // gulp-purgecss 모듈을 가져옴
const browserSync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const clean = require("gulp-clean");
const tinify = require("gulp-tinify");

// File paths
const files = {
  distPath: "./dist",
  stylePath: "./styles/**/*.css",
  htmlPath: "./**/*.html",
  includePath: "./include/**/*.html",
  jsPath: "./js/**/*.js",
  fontPath: "./styles/fonts/**/*",
  imagePath: "./styles/images/**/*",
};

// Task to clean dist directory
function cleanDist() {
  return src(files.distPath + "/*", { read: false, allowEmpty: true }) // dist 폴더 안의 모든 파일을 대상으로 설정
    .pipe(clean());
}

// Task to compile styles
function stylesTask() {
  return src(files.stylePath).pipe(dest(files.distPath + "/styles"));
}

// Task to compile JavaScript files
function javascriptTask() {
  return src(files.jsPath).pipe(dest(files.distPath + "/js"));
}

// Task to include HTML files
function fileincludeTask() {
  return src([files.htmlPath, "!./include/*.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(dest(files.distPath));
}

// Task to remove unused CSS
function purgeCssTask() {
  return src(files.stylePath)
    .pipe(
      purgecss({
        content: [files.htmlPath, files.includePath],
      })
    )
    .pipe(dest(files.distPath + "/styles/css")); // CSS 파일을 dist/styles/css로 이동
}

// Task to copy font files
function fontsTask() {
  return src(files.fontPath).pipe(dest(files.distPath + "/styles/fonts"));
}

// Task to move image files to dist/styles/images directory
function imagesTask() {
  return src(files.imagePath).pipe(dest(files.distPath + "/styles/images"));
}

// Task to synchronize browser with changes and reload
function browserSyncTask() {
  var options = {
    server: {
      baseDir: files.distPath,
    },
    open: "external",
  };
  browserSync.init(options);
}

// Watch task
function watchTask() {
  watch(files.htmlPath, series(fileincludeTask, browserSync.reload));
  watch(files.includePath, series(fileincludeTask, browserSync.reload));
  watch(files.jsPath, series(javascriptTask, browserSync.reload));
  watch(files.stylePath, series(stylesTask, purgeCssTask, browserSync.reload));
  watch(files.fontPath, series(fontsTask, browserSync.reload));
  watch(files.imagePath, series(imagesTask, browserSync.reload));
}

// Default task
exports.default = series(
  cleanDist,
  parallel(stylesTask, javascriptTask, fileincludeTask, fontsTask, imagesTask), // imagesTask 추가
  series(purgeCssTask, browserSyncTask),
  watchTask // 추가된 watchTask 호출
);
