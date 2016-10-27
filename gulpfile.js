const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

gulp.task('docs', function() {
    // We don't want to add css tags to the main README - replace them with blank
    gulp.src('docs/README.raw.md')
        .pipe(replace('{{badge.css}}', ''))
        .pipe(rename('README.md'))
        .pipe(gulp.dest('.'));

    gulp.src('docs/README.raw.md')
        .pipe(replace('{{badge.css}}', '{: class="badge" }'))
        .pipe(rename('index.md'))
        .pipe(gulp.dest('docs/'));
});