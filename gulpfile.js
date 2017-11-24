const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const run = require('gulp-run');
const path = require('path');
const spawn = require('cross-spawn');
const tap = require('gulp-tap');
const tslint = require('gulp-tslint');
const typedoc = require('gulp-typedoc');

gulp.task('build', ['setup', 'lint'], function () {
    return run('node node_modules/typescript/bin/tsc').exec();
});

var testStatus;
// Runs each test file as its own process using spawn
// We use the testStatus variable to track if any of the processes had failing tests
gulp.task('test-suite-run', ['build'], function() {
    return gulp.src(['test/**/*-test.js'])
        .pipe(
            tap(function(file, t) {
                const testFile = path.relative(process.cwd(), file.path);

                const mocha = spawn.sync('node_modules/mocha/bin/mocha', ['--colors', testFile]);

                if (mocha.error) {
                    console.error('Error: ' + mocha.error, mocha.error);
                }

                testStatus |= mocha.status;
                if (mocha.stdout) {
                    console.log(mocha.stdout.toString());
                }

                if (mocha.stderr && mocha.stderr.length) {
                    console.error("Errors:\n" + mocha.stderr);
                }
            })
        );
});


const validateTestStatusAndExit = (doneFunction, typeOfProcess) => {
    var message = typeOfProcess + " Completed. All Tests Succeeded.";
    if (testStatus > 0) {
        message = typeOfProcess +" Completed. Some Tests Failed.";
    }
    console.log(message);

    if (testStatus !== 0) {
        process.exit(1);
    } else {
        doneFunction();
    }
};

// Runs the all the test suites, and then based on the status, exits
// This is a separate task because there is not an easy way to tell when each of the Test Suite processes finishes
gulp.task('test', ['test-suite-run'], function (done) {
    validateTestStatusAndExit(done, "Tests");
});


// Clean up the .nyc_output directory
// Needs to be run before coverage, as we generate many files into the directory while running
gulp.task('coverage-clean', ['build'], function(done) {
    run('rm -rf .nyc_output').exec(function () {
        run('mkdir .nyc_output').exec(function () {
            done();
        });
    });
});

gulp.task('coverage-suite-run', ['coverage-clean'], function() {
    return gulp.src(['test/**/*-test.js'])
        .pipe(
            tap(function(file, t) {
                var testFile = path.relative(process.cwd(), file.path);

                var nyc = spawn.sync('node_modules/.bin/nyc', ['--clean=false','--silent=true',
                    'node_modules/.bin/mocha', '--colors', testFile]);
                if (nyc.error) {
                    console.error(nyc.error);
                }

                testStatus |= nyc.status;
                console.log(nyc.stdout.toString());
                if (nyc.stderr.length) {
                    console.error(nyc.stderr.toString());
                }
            })
        );
});

gulp.task("coverage", ['coverage-suite-run'], function (done) {
    run('nyc report --reporter=json').exec(function() {
        done();
    })
});

gulp.task("codecov", ['coverage-suite-run'], function (done) {
    run('nyc report --reporter=json && codecov -f coverage/*.json').exec(function() {
        validateTestStatusAndExit(done, "Coverage");
    });
});

gulp.task("coveralls", ['coverage-suite-run'], function (done) {
    run('nyc report --reporter=text-lcov | coveralls').exec(function() {
        validateTestStatusAndExit(done, "Coverage");
    });
});

gulp.task('setup', function (done) {
    run('npm install').exec(function () {
        done();
    });
});

gulp.task('lint', function() {
    return gulp.src(["lib/**/*.ts", "bin/*.ts", "test/**/*.ts", "!lib/**/*.d.ts", "!bin/*.d.ts", "!test/**/*.d.ts"])
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
            'lib/client/bst-proxy.ts',
            'lib/client/lambda-server.ts',
            'lib/logless/logless.ts',
            'lib/logless/logless-context.ts']
        ).pipe(typedoc({
            // TypeScript options (see typescript docs)
            excludePrivate: true,
            excludeNotExported: true,
            excludeExternals: true,
            ignoreCompilerErrors: true,
            mode: 'file',
            name: 'Bespoken',
            readme: 'docs/api_readme.md',
            target: 'ES6',
            out: 'docs/api',
            version: true
        })
    );
});
