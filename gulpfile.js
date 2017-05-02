const gulp = require('gulp');
const mocha = require('gulp-mocha');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const tslint = require('gulp-tslint');
const typedoc = require('gulp-bst-typedoc');
var typescript = require('gulp-tsc');
const run = require('gulp-run');
const shell = require('gulp-shell');

gulp.task('build', ['setup', 'lint'], function () {
    return gulp.src([]).pipe(typescript());
});

// http://stackoverflow.com/questions/33191377/gulp-hangs-after-finishing
gulp.task('test', ['build'], function() {
    return gulp.src(['test/**/*-test.js'])
        .pipe(mocha());
});

gulp.task('setup', function (done) {
    run('npm install').exec(function () {
        run('typings install').exec(function () {
            done();
        });
    });
});

gulp.task('lint', function() {
    return gulp.src(["lib/**/*.ts", "bin/*.ts", "test/**/*.ts", "!lib/**/*.d.ts", "!bin/*.d.ts"])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
});

gulp.task('docs', ['mkdocs', 'typedoc']);

gulp.task('mkdocs', function() {
    // We don't want to add css tags to the main README - replace them with blank
    gulp.src('README.md')
        .pipe(rename('index.md'))
        .pipe(gulp.dest('docs/'));
});

gulp.task('typedoc', function () {
    gulp.src(['lib/alexa/audio-item.ts',
            'lib/alexa/alexa-context.ts',
            'lib/alexa/alexa-session.ts',
            'lib/client/bst-alexa.ts',
            'lib/client/bst-encode.ts',
            'lib/client/lambda-server.ts',
            'lib/logless/logless.ts',
            'lib/logless/logless-context.ts']
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
