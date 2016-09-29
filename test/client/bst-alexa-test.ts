/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {BSTAlexa} from "../../lib/client/bst-alexa";
import {LambdaServer} from "../../lib/client/lambda-server";
import {Global} from "../../lib/core/global";
import * as sinon from "sinon";

describe("BSTAlexa", function() {
    let alexa: BSTAlexa = null;
    let lambdaServer: LambdaServer = null;

    describe("#start()", function () {
        let sandbox: any = null;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it("Start with defaults", function (done) {
            process.chdir("test/resources");
            let speak = new BSTAlexa("http://localhost:9000");
            speak.start(function (error: string) {
                assert(error === undefined);
                process.chdir("../..");
                done();
            });
        });

        it("Initializes with specified files", function (done) {
            let speak = new BSTAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.start(function (error: string) {
                assert(error === undefined);
                done();
            });
        });

        it("Initializes with application ID", function (done) {
            let speak = new BSTAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt",
                "1234567890J");
            speak.start(function () {
                assert(Global.config().applicationID(), "1234567890J");
                done();
            });
        });

        it("Initializes with error", function (done) {
            let errorReceived = false;
            sandbox.stub(console, "error", function(data: Buffer) {
                if (data !== undefined) console.log(data);
                if (!errorReceived && data.toString().startsWith("Error loading")) {
                    errorReceived = true;
                }
            });

            let speak = new BSTAlexa("http://localhost:9000",
                "test/resources/speechAssets/Intent.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.start(function (error: string) {
                assert(error);
                assert.equal(error, "File not found: test/resources/speechAssets/Intent.json");
                assert(errorReceived);
                done();
            });
        });
    });

    describe("Speaks and Intends", function () {
        beforeEach(function (done) {
            process.chdir("test/resources");
            alexa = new BSTAlexa("http://localhost:10000");
            alexa.start(function () {
                lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
                lambdaServer.start();
                done();
            });
        });

        afterEach(function (done) {
            lambdaServer.stop(function () {
                alexa.stop(function () {
                    process.chdir("../..");
                    done();
                });
            });
        });

        describe("#speak()", function () {
            it("Speak phrase", function (done) {
                alexa.spoken("Hello", function (error: any, response: any) {
                    assert.equal(response.output, "Well, Hello To You");
                    done();
                });
            });

            it("Speak non-grammar phrase", function (done) {
                alexa.spoken("Dumb", function (error: any, response: any) {
                    assert(response.output === undefined);
                    assert(response.success);
                    assert.equal(response.intent, "Test");
                    done();
                });
            });

            it("Speak with error", function (done) {
                lambdaServer.stop(function () {
                    lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 9000);
                    lambdaServer.start();

                    alexa.spoken("Have I Erred", function (error: any, response: any) {
                        assert(error);
                        assert.equal(error.message, "connect ECONNREFUSED 127.0.0.1:10000");
                        assert(!response);
                        done();
                    });
                });
            });
        });

        describe("#launched()", function() {
            it("Launched", function (done) {
                alexa.launched(function (error: any, response: any) {
                    assert(response.launched);
                    done();
                });
            });
        });

        describe("#ended()", function() {
            it("Ended", function (done) {
                alexa.sessionEnded("ERROR", function (error: any, response: any) {
                    assert(response.ended);
                    done();
                });
            });
        });

        describe("#intended()", function () {
            it("Intended successfully", function (done) {
                alexa.intended("HelloIntent", null, function (error: any, response: any) {
                    assert.equal(response.output, "Well, Hello To You");
                    done();
                });

            });

            it("Intended with bad intent", function (done) {
                alexa.intended("Hello", null, function (error, response) {
                    assert(!response);
                    assert(error);
                    done();
                });
            });
        });

        describe("#on()", function() {
            it("On skill response received", function (done) {
                alexa.intended("HelloIntent", null);
                alexa.on("response", function (response: any) {
                    assert.equal(response.output, "Well, Hello To You");
                    done();
                });
            });
        });
    });


    describe("AudioPlayer Tests", function () {
        beforeEach(function (done) {
            process.chdir("test/resources");
            alexa = new BSTAlexa("http://localhost:10000");
            alexa.start(function () {
                lambdaServer = new LambdaServer("AudioPlayerLambda.js", 10000);
                lambdaServer.start();
                done();
            });
        });

        afterEach(function (done) {
            lambdaServer.stop(function () {
                alexa.stop(function () {
                    process.chdir("../..");
                    done();
                });
            });
        });

        describe("#on()", function() {
            it("Audio Item Started Event received", function (done) {
                alexa.intended("PlayIntent", null, function () {
                    alexa.audioItemFinished();
                    alexa.on("AudioPlayer.PlaybackStarted", function (audioItem: any) {
                        assert.equal(audioItem.stream.token, "2");
                        done();
                    });
                });
            });
        });

        describe("#audioItemFinished()", function() {
            it("Audio Item Finished", function (done) {
               let count = 0;
                alexa.on("response", function (response: any, request: any) {
                    console.log("RequestType: " + request.request.type);
                    count++;
                    if (count === 4) {
                        assert.equal(request.request.type, "AudioPlayer.PlaybackFinished");
                        done();
                    }
                });

                alexa.intended("PlayIntent", null, function () {
                    alexa.audioItemFinished();
                });
            });
        });
    });
});