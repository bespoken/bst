/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {BSTSpeak} from "../../lib/client/bst-speak";
import {LambdaRunner} from "../../lib/client/lambda-runner";

describe("BSTSpeak", function() {
    describe("#initialize()", function() {
        it("Initializes with defaults", function (done) {
            process.chdir("test/resources");
            let speak = new BSTSpeak("http://localhost:9000");
            speak.initialize(function (error: string) {
                assert(error === undefined);
                process.chdir("../..");
                done();
            });
        });

        it("Initializes with specified files", function (done) {
            let speak = new BSTSpeak("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.initialize(function (error: string) {
                assert(error === undefined);
                done();
            });
        });

        it("Initializes with error", function (done) {
            let speak = new BSTSpeak("http://localhost:9000",
                "test/resources/speechAssets/Intent.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.initialize(function (error: string) {
                assert(error);
                assert.equal(error, "File not found: test/resources/speechAssets/Intent.json");
                done();
            });
        });
    });

    describe("#speak()", function() {
        it("Speak phrase", function (done) {
            process.chdir("test/resources");
            let speak = new BSTSpeak("http://localhost:10000");
            speak.initialize(function () {
                let lambdaRunner = new LambdaRunner("exampleProject/ExampleLambda.js", 10000);
                lambdaRunner.start();
                speak.spoken("Hello", function(request: any, response: any) {
                    assert.equal(response.output, "Well, Hello To You");

                    lambdaRunner.stop(function() {
                        process.chdir("../..");
                        done();
                    });
                });
            });
        });

        it("Speak non-grammar phrase", function (done) {
            process.chdir("test/resources");
            let speak = new BSTSpeak("http://localhost:10000");
            speak.initialize(function () {
                let lambdaRunner = new LambdaRunner("exampleProject/ExampleLambda.js", 10000);
                lambdaRunner.start();
                speak.spoken("Dumb", function(request: any, response: any) {
                    assert(response.output === undefined);
                    assert(response.success);
                    assert.equal(response.intent, "Test");

                    lambdaRunner.stop(function() {
                        process.chdir("../..");
                        done();
                    });
                });
            });
        });
    });
});