const { src, dest, watch, parallel, series} = require('gulp')
const scss   = require('gulp-sass')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const del = require('del')

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'project/'
        }
    })
}

function cleanDist() {
    return del('dist')
}

function images () {
    return src('project/images/**/*')
    .pipe(imagemin(
        [
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/images'))
}

function scripts() {
    return src([
        // Скрипты JS
        'node_modules/jquery/dist/jquery.js',
        // Последний файл main.js ()
        'project/js/main.js',
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('project/js'))
    .pipe(browserSync.stream())
}


function styles() { //Файл стилей *настройки
    return src('project/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('project/css'))
        .pipe(browserSync.stream())
}

function build () {
    return src([
        'project/css/style.min.css',
        'project/fonts/**/*',
        'project/js/main.min.js',
        'project/*.html'
    ], {base: 'project'})
        .pipe(dest('dist'))
}

function watching() { //Смотрящий за правками в файлах
    watch(['project/scss/**/*.scss'], styles);
    watch(['project/js/**/*.js','!project/js/main.min.js'], scripts);
    watch(['project/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);