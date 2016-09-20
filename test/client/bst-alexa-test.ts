/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {BSTAlexa} from "../../lib/client/bst-alexa";
import {LambdaServer} from "../../lib/client/lambda-server";
import {Global} from "../../lib/core/global";

describe("BSTAlexa", function() {
    describe("#initialize()", function() {
        it("Initializes with defaults", function (done) {
            process.chdir("test/resources");
            let speak = new BSTAlexa("http://localhost:9000");
            speak.initialize(function (error: string) {
                assert(error === undefined);
                process.chdir("../..");
                done();
            });
        });

        it("Initializes with specified files", function (done) {
            let speak = new BSTAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.initialize(function (error: string) {
                assert(error === undefined);
                done();
            });
        });

        it("Initializes with application ID", function (done) {
            let speak = new BSTAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt",
                "1234567890J");
            speak.initialize(function () {
                assert(Global.config().applicationID(), "1234567890J");
                done();
            });
        });

        it("Initializes with error", function (done) {
            let speak = new BSTAlexa("http://localhost:9000",
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
            let speak = new BSTAlexa("http://localhost:10000");
            speak.initialize(function () {
                let lambdaRunner = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
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
            let speak = new BSTAlexa("http://localhost:10000");
            speak.initialize(function () {
                let lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
                lambdaServer.start();
                speak.spoken("Dumb", function(request: any, response: any) {
                    assert(response.output === undefined);
                    assert(response.success);
                    assert.equal(response.intent, "Test");

                    lambdaServer.stop(function() {
                        process.chdir("../..");
                        done();
                    });
                });
            });
        });
    });

    describe("#intended()", function() {
        it("Intended successfully", function (done) {
            process.chdir("test/resources");
            let speak = new BSTAlexa("http://localhost:10000");
            speak.initialize(function () {
                let lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
                lambdaServer.start();
                speak.intended("HelloIntent", null, function(request: any, response: any) {
                    assert.equal(response.output, "Well, Hello To You");

                    lambdaServer.stop(function() {
                        process.chdir("../..");
                        done();
                    });
                });
            });
        });

        it("Intended with bad intent", function (done) {
            process.chdir("test/resources");
            let speak = new BSTAlexa("http://localhost:10000");
            speak.initialize(function () {
                let lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
                lambdaServer.start();
                speak.intended("Hello", null, function (request, response, error) {
                    assert(!response);
                    assert(error);
                    lambdaServer.stop(function() {
                        process.chdir("../..");
                        done();
                    });
                });
            });
        });
    });

    describe("#onSkillResponse()", function() {
        it("On skill response received", function (done) {
            process.chdir("test/resources");
            let speak = new BSTAlexa("http://localhost:10000");
            speak.initialize(function () {
                let lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
                lambdaServer.start();
                speak.intended("HelloIntent", null);
                speak.onSkillResponse(function (request, response) {
                    assert.equal(response.output, "Well, Hello To You");

                    speak.shutdown(function () {
                        lambdaServer.stop(function() {
                            process.chdir("../..");
                            done();
                        });
                    });
                });
            });
        });
    });
});