import * as assert from "assert";
import {LambdaServer} from "../../lib/client/lambda-server";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {BSTProcess} from "../../lib/client/bst-config";

let applicationID = "abc";

let globalModule = {
    Global: {
        initializeCLI: async function () {
        },
        config: function () {
            return {
                configuration: {
                    lambdaDeploy: {},
                },
                save: function () {

                },
                applicationID: function() {
                    return applicationID;
                },
                updateApplicationID: function (id) {
                    applicationID = id;
                }
            };
        },
        running : function() {
            let p = new BSTProcess();
            p.port = 9999;
            return p;
        },

        version: function () {
            return "0.0.0";
        },
    }
};

describe("BSTVirtualAlexa", async function() {
    let alexa = null;
    let lambdaServer: LambdaServer = null;
    let BSTVirtualAlexa;

    before(function () {
        BSTVirtualAlexa = require("../../lib/client/bst-virtual-alexa").BSTVirtualAlexa;
    });

    describe("#start()", function () {
        let sandbox: any = null;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            mockery.enable({useCleanCache: true});
            mockery.warnOnUnregistered(false);
            mockery.registerMock("../core/global", globalModule);
            BSTVirtualAlexa = require("../../lib/client/bst-virtual-alexa").BSTVirtualAlexa;
        });

        afterEach(function () {
            mockery.deregisterAll();
            mockery.disable();
            sandbox.restore();
        });

        describe("BSTAlexa Without Config", function() {
            it("#start()", function () {
                const speak = new BSTVirtualAlexa("http://localhost:9000",
                    "test/resources/speechAssets/IntentSchema.json",
                    "test/resources/speechAssets/SampleUtterances.txt");
                speak.start();
                assert(true, "Start processed without exceptions");
            });
        });

        it("Start with defaults", function () {
            process.chdir("test/resources");
            const speak = new BSTVirtualAlexa("http://localhost:9000");
            speak.start();
            assert(true, "Start processed without exceptions");
            process.chdir("../..");
        });

        it("Initializes with specified files", function () {
            const speak = new BSTVirtualAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.start();
            assert(true, "Start processed without exceptions");
        });

        it("Initializes with application ID", function () {
            this.timeout(5000);
            const speak = new BSTVirtualAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt",
                "1234567890J");
            speak.start();
            assert(globalModule.Global.config().applicationID(), "1234567890J");
        });

        it("Initializing after setting the application ID initialize with application ID", function () {
            this.timeout(5000);
            const speak = new BSTVirtualAlexa("http://localhost:9000",
                "test/resources/speechAssets/IntentSchema.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            speak.start();
            assert(globalModule.Global.config().applicationID(), "1234567890J");
            assert(speak.context().applicationID(), "1234567890J");
        });

        it("Initializes with error", function (done) {
            let errorReceived = false;
            sandbox.stub(console, "error", function(data: Buffer) {
                if (!errorReceived && data.toString().startsWith("Error loading")) {
                    errorReceived = true;
                }
            });

            const speak = new BSTVirtualAlexa("http://localhost:9000",
                "test/resources/speechAssets/Intent.json",
                "test/resources/speechAssets/SampleUtterances.txt");
            try {
                speak.start();
            } catch (error) {
                assert(error);
                assert.equal(error.message, "ENOENT: no such file or directory, open 'test/resources/speechAssets/Intent.json'");
                assert(errorReceived);
                done();
            }
        });
    });

    describe("Speaks and Intends", function () {
        beforeEach(function () {
            process.chdir("test/resources");
            alexa = new BSTVirtualAlexa("http://localhost:10000");
            lambdaServer = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
            lambdaServer.start();
            alexa.start();
        });

        afterEach(function (done) {
            lambdaServer.stop(function () {
                process.chdir("../..");
                done();
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
     });
});
