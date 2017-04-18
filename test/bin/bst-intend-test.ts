/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import SinonSandbox = Sinon.SinonSandbox;

let globalModule = {
    Global: {
        initializeCLI: async function () {

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
let BSTAlexa: any;
let sandbox: SinonSandbox = null;

describe("bst-intend", function() {
    beforeEach(function () {
         BSTAlexa = function () {
            this.start = function (ready: Function) {
                ready();
            };
        };

        mockery.enable({ useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false });
        mockery.registerMock("../lib/core/global", globalModule);
        mockery.registerMock("../lib/client/bst-alexa", {
            BSTAlexa: BSTAlexa
        });

        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("intend command", function() {
        it("Intend Simple", function(done) {
            process.argv = command("node bst-intend.js HelloIntent");

            BSTAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
                assert.equal(intent, "HelloIntent");
                // callback simulating request (error, request)
                callback(null, "Response: Here is a response");
            };

            sandbox.stub(console, "log", function(data: Buffer) {
                if (data !== undefined && data.indexOf("Response: ") !== -1) {
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intend No Match", function(done) {
            process.argv = command("node bst-intend.js Hello");
            BSTAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
                throw Error("No intent matching: " + intent);
            };

            sandbox.stub(console, "error", function(data: Buffer) {
                if (data !== undefined && data.toString() === "No intent matching: Hello") {
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intend With Slot", function(done) {
            process.argv = command("node bst-intend.js Hello Test=Test1");
            BSTAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
                assert.equal(slots["Test"], "Test1");
                done();
            };

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intend With BadSlot", function(done) {
            process.argv = command("node bst-intend.js Hello Test");
            let matched = false;
            sandbox.stub(console, "error", function(data: Buffer) {
                if (data !== undefined && data.toString() === "Invalid slot specified: Test. Must be in the form SlotName=SlotValue") {
                    matched = true;
                }
            });

            sandbox.stub(process, "exit", function(exitCode: number) {
                assert(matched);
                assert.equal(exitCode, 0);
                done();
            });
            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intend With Multiple Slots", function(done) {
            process.argv = command("node bst-intend.js Hello Test=Test1 Test2=TestValue");
            BSTAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
                assert.equal(slots["Test"], "Test1");
                assert.equal(slots["Test2"], "TestValue");
                done();
            };

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With Application ID", function(done) {
            process.argv = command("node bst-intend.js HelloIntent --appId 1234567890");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With Application ID", function(done) {
            process.argv = command("node bst-intend.js HelloIntent -a 1234567890");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With access token", function(done) {
            process.argv = command("node bst-intend.js Hello -a 1234567890 -t AccessToken");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.accessToken, "AccessToken");
                    this.start = function () {};
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With user id", function(done) {
            process.argv = command("node bst-intend.js Hello --userId 1234");
            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function (skillURL: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.userId, "1234");
                    this.start = function () {};
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Speaks With Custom URL", function(done) {
            process.argv = command("node bst-intend.js HelloIntent --url https://proxy.bespoken.tools");
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

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Has no interaction model", function(done) {
            process.argv = command("node bst-intend.js HelloIntend");

            mockery.registerMock("../lib/client/bst-alexa", {
                BSTAlexa: function() {
                    this.start = function (ready: Function) {
                        ready("No interaction model found");
                    };

                    this.intended = function () {
                        assert(false);
                    };
                }
            });

            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
                done();
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Has No Process", function(done) {
            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
            });

            let count = 0;
            sandbox.stub(console, "log", function(data: Buffer) {
                count++;
                if (count === 5) {
                    assert(data.toString().indexOf("proxy is running") !== -1);
                    done();
                }
            });

            process.argv = command("node bst-intend.js HelloIntent");
            // Prints out error if no process running
            globalModule.Global.running = function () {
                return null;
            };

            NodeUtil.load("../../bin/bst-intend.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};