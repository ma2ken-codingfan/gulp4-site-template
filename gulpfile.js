const {src, dest, watch, series, parallel} = require("gulp")
const sass = require("gulp-sass")
const header = require("gulp-header")
const replace = require("gulp-replace")
const plumber = require("gulp-plumber")
const postcss = require('gulp-postcss')
const sassGlob = require("gulp-sass-glob")
const autoprefixer = require('gulp-autoprefixer')
const notify= require("gulp-notify")
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync')
const del = require('del')

const topDir = 'projects/'
const secDir = 'default-template/'
const source = 'source/'
const output = 'output/'
const deproy = 'deproy'

const sourcePath = topDir + secDir + source
const outputPath = topDir + secDir + output
const deproyPath = topDir + secDir + deproy

const fileSrc = {
  html: `${sourcePath}html/**/*.html`,
  scss: `${sourcePath}scss/**/*.scss`
}

const htmlFunc = done => {
  src(fileSrc.html)
    .pipe(plumber(notify.onError('Error: <%= error.message %>')))
    .pipe(dest(outputPath))
    .pipe(dest(deproyPath))
    .pipe(browserSync.reload({ stream: true }))
  done()
}

const styles = done => {
  src(fileSrc.scss)
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(plumber(notify.onError('Error: <%= error.message %>')))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true
      })
    )
    .pipe(sass())
    .pipe(replace(/@charset "UTF-8";/g, ''))
    .pipe(header('@charset "UTF-8";\n\n'))
    .pipe(dest(outputPath))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(replace(/@charset "UTF-8";/g, ''))
    .pipe(header('@charset "UTF-8";\n\n'))
    .pipe(dest(deproyPath))
    .pipe(browserSync.reload({ stream: true }))
  done()
}

//Clean
const clean = (done) => {
  del.sync(outputPath + '/**', '！' + outputPath)
  del.sync(deproyPath + '/**', '！' + deproyPath)
  done()
}

const buildServer = done => {
  browserSync.init({
    server: {
      baseDir: `${deproyPath}`
    },
    // ローカルで開く
    //open: 'external',
  })
  done()
  console.log('server was launched')
}


const watchTasks = (done) => {
  const browserReload = done => {
    browserSync.reload()
    done()
  }
  watch(`${fileSrc.html}`, series(htmlFunc, browserReload))
  watch(`${fileSrc.scss}`, series(styles, browserReload))
  done()
}

// exports でgulpから叩ける
exports.default = series(clean, htmlFunc, styles, parallel(buildServer, watchTasks))
