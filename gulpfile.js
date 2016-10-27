const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const typedoc = require('gulp-bst-typedoc');
const run = require('gulp-run');
const tsc = require('gulp-tsc');

gulp.task('setup', function (done) {
    run('npm install').exec(function () {
        run('typings install').exec(function () {
            done();
        });
    });
});

gulp.task('build', function () {
    gulp.src(['lib/**/*.ts'])
        .pipe(tsc())
        .pipe(gulp.dest('/'))
});

gulp.task('docs', ['mkdocs', 'typedoc']);

gulp.task('mkdocs', function() {
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

gulp.task('typedoc', function () {
    gulp.src(['lib/alexa/audio-item.ts',
            'lib/client/bst-alexa.ts',
            'lib/client/bst-encode.ts',
            'lib/client/lambda-server.ts',
            'lib/logless/logless.ts']
        ).pipe(typedoc({
            // TypeScript options (see typescript docs)
            excludePrivate: true,
            excludeNotExported: true,
            excludeExternals: true,
            mode: 'file',
            name: 'Bespoken Tools',
            readme: 'docs/api_readme.md',
            target: 'ES6',
            out: 'docs/api',
            version: true
        })
    );
});