const {
    src,
    dest,
    watch,
    series,
    parallel
} = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat')
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const mode = require('gulp-mode')();
const browserSync = require('browser-sync').create();

// clean tasks
function clean(done) {
    return del(['dist']);
    done();
}

function cleanImages(done) {
    return del(['dist/assets/images']);
    done();
}

// const cleanFonts = () => {
//     return del(['dist/assets/fonts']);
// }

// css task
function css(done) {
    src('src/sass/index.scss')
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(concat('app.css'))
        .pipe(mode.production(csso()))
        .pipe(mode.development(sourcemaps.write()))
        .pipe(dest('dist'))
        .pipe(mode.development(browserSync.stream()));

    done();
}

// js task
function js(done) {
    src('src/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(mode.development(sourcemaps.init({
            loadMaps: true
        })))
        .pipe(concat('app.js'))
        .pipe(mode.production(terser({
            output: {
                comments: false
            }
        })))
        .pipe(mode.development(sourcemaps.write()))

        .pipe(dest('dist'))
        .pipe(mode.development(browserSync.stream()));

    done();
}

// copy tasks
function copyImages(done) {
    src('src/assets/images/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(dest('dist/assets/images'));

    done();
}

function convertImages(done) {
    src('src/assets/images/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(imagemin())
        .pipe(dest('dist/assets/images'));
    done()
}

// const copyFonts = () => {
//     return src('src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}')
//         .pipe(dest('dist/assets/fonts'));
// }

// watch task
function watchForChanges(done) {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    watch('src/sass/**/*.scss', css);
    watch('src/**/*.js', js);
    watch('**/*.html').on('change', browserSync.reload);
    watch('src/assets/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages, convertImages));
    // watch('src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}', series(cleanFonts, copyFonts));
    done();
}

// public tasks
exports.default = series(clean, parallel(css, js, copyImages, convertImages
    // copyFonts
), watchForChanges);
exports.build = series(clean, parallel(css, js, copyImages, convertImages
    //  copyFonts
));