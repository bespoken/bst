const spawn = require('child_process').spawnSync;
const foreach = require('gulp-foreach');
const gulp = require('gulp');
const mocha = require('gulp-spawn-mocha');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const tslint = require('gulp-tslint');
const typedoc = require('gulp-bst-typedoc');
const run = require('gulp-run');
const shell = require('gulp-shell');
const tap = require("gulp-tap");
const Mocha = require('mocha');
const Path = require('path');

gulp.task('build', ['setup', 'lint'], function () {
    return run('node_modules/typescript/bin/tsc').exec();
});

// http://stackoverflow.com/questions/33191377/gulp-hangs-after-finishing
gulp.task('test-run', function() {
    var pass = 0;
    var fail = [];
    return gulp.src(['test/alexa/*-test.js'])
        .pipe(
            tap(function(file, t) {
                var testFile = Path.relative(process.cwd(), file.path);
                // Instantiate a Mocha instance.
                // var mocha = new Mocha();
                //
                // var testFile = Path.relative(process.cwd(), file.path);
                // console.log("File: " + testFile);
                // mocha.addFile(testFile);
                //
                // var runner = mocha.run();
                //
                // runner.on('pass', function (e) {
                //     pass++;
                // });
                //
                // runner.on('fail', function (e) {
                //     fail.push(e.title);
                // });

                var mocha = spawn("node_modules/mocha/bin/mocha", ["--colors", testFile]);
                if (mocha.error) {
                    console.error("Error: " + mocha.error);
                }
                console.error("Status: " + mocha.status);
                console.log(mocha.stdout.toString());
                if (mocha.stderr.length) {
                    console.log("Errors:\n" + mocha.stderr);
                }
            })
        );
});

gulp.task("test", ["test-run"], function () {
    console.log("done");
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
