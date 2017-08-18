import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import {SinonSandbox} from "sinon";

describe("bst-speak", function() {
    let globalModule = {
        Global: {
            initializeCLI: async function () {

            },
            config: function () {
                return {};
            },
            running : function() {
                let p = new BSTProcess();
                p.port = 9999;
                return p;
            },

            version: function () {
                return "0.0.0";
            }
        }
    };

    let sandbox: SinonSandbox = null;
    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("../lib/core/global", globalModule);
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("speak command", function() {
        it("Speaks One Word", function(done) {
            process.argv = command("node bst-speak.js Hello");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function () {
                    this.start = function(ready: Function) {
                        ready();
                    };

                    this.spoken = function (utterance: string, callback: any) {
                        assert.equal(utterance, "Hello");
                        callback(null, {"request": "test"}, {"response": "test"});
                    };
                }
            });

            sandbox.stub(console, "log", function(data: Buffer) {
                if (data !== undefined && data.indexOf("Response:") !== -1) {
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With Application ID", function(done) {
            process.argv = command("node bst-speak.js Hello --appId 1234567890");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With Application ID Succinct Syntax", function(done) {
            process.argv = command("node bst-speak.js Hello -a 1234567890");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With access token", function(done) {
            process.argv = command("node bst-speak.js Hello -a 1234567890 -t AccessToken -i test/alexa/resources/IntentSchema.json -s test/alexa/resources/SampleUtterances.txt");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.accessToken, "AccessToken");
                    this.start = function () {};
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With user id", function(done) {
            process.argv = command("node bst-speak.js Hello --userId 123456");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.userId, "123456");
                    this.start = function () {};
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With user id abbreviated", function(done) {
            process.argv = command("node bst-speak.js Hello -U 123456");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.userId, "123456");
                    this.start = function () {};
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With Custom URL", function(done) {
            process.argv = command("node bst-speak.js Hello --url https://proxy.bespoken.tools");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (url: string) {
                    this.url = url;
                    this.start = function(ready: Function) {
                        assert.equal(this.url, "https://proxy.bespoken.tools");
                        ready();
                        done();
                    };

                    this.spoken = function (utterance: string, callback: any) {};
                }
            });

            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks One Word With Verbose", function(done) {
            process.argv = command("node bst-speak.js Hello");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function () {
                    this.start = function(ready: Function) {
                        ready();
                    };

                    this.spoken = function (utterance: string, callback: any) {
                        assert.equal(utterance, "Hello");
                        callback(null, {"response": "test"}, {"request": "test"});
                    };
                }
            });

            let count = 0;
            sandbox.stub(console, "log", function(data: Buffer) {
                count++;
                if (count === 4 && data !== undefined) {
                    assert(data.toString().indexOf("request") !== -1);
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks Multiple Word", function(done) {
            process.argv = command("node bst-speak.js Hello There Ladies And Gentlemen");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function () {
                    this.start = function(ready: Function) {
                        ready();
                    };

                    this.spoken = function (utterance: string) {
                        assert.equal(utterance, "Hello There Ladies And Gentlemen");
                        done();
                        return this;
                    };
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Has no interaction model", function(done) {
            process.argv = command("node bst-speak.js Hello There Ladies And Gentlemen");

            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
                assert(messageReceived);
                done();
            });

            let messageReceived = false;
            sandbox.stub(console, "error", function(message: string) {
                if (message !== undefined && message.indexOf("Cause: ") !== -1) {
                    messageReceived = true;
                }
            });

            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Has No Process", function(done) {
            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
            });

            let count = 0;
            sandbox.stub(console, "log", function(data: Buffer) {
                count++;
                if (count === 4) {
                    assert(data.toString().indexOf("proxy is running") !== -1);
                    done();
                }
            });

            process.argv = command("node bst-speak.js Hello There Ladies And Gentlemen");
            // Prints out error if no process running
            globalModule.Global.running = function () {
                return null;
            };

            NodeUtil.load("../../bin/bst-speak.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};