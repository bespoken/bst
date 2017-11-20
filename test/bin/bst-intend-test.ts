import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import {SinonSandbox} from "sinon";

const globalModule = {
    Global: {
        initializeCLI: async function () {

        },
        running : function() {
            const p = new BSTProcess();
            p.port = 9999;
            return p;
        },

        version: function () {
            return "0.0.0";
        }
    }
};
let BSTVirtualAlexa: any;
let sandbox: SinonSandbox = null;

describe("bst-intend", function() {
    beforeEach(function () {
        BSTVirtualAlexa = function () {
            this.start = function () {
            };
        };

        mockery.enable({ useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false });
        mockery.registerMock("../lib/core/global", globalModule);
        mockery.registerMock("../lib/client/bst-virtual-alexa", {
            BSTVirtualAlexa: BSTVirtualAlexa
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

            BSTVirtualAlexa.prototype.intended = function (intentName: string, slots: any, callback: Function) {
                assert.equal(intentName, "HelloIntent");
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
            BSTVirtualAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
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
            BSTVirtualAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
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
            BSTVirtualAlexa.prototype.intended = function (intent: string, slots: any, callback: Function) {
                assert.equal(slots["Test"], "Test1");
                assert.equal(slots["Test2"], "TestValue");
                done();
            };

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With Application ID long version", function(done) {
            process.argv = command("node bst-intend.js HelloIntent --appId 1234567890");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With Application ID short version", function(done) {
            process.argv = command("node bst-intend.js HelloIntent -a 1234567890");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With access token", function(done) {
            process.argv = command("node bst-intend.js Hello -a 1234567890 -t AccessToken");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.accessToken, "AccessToken");
                    this.start = function () {};
                    this.context = function() {
                        return {
                            setAccessToken: function (token: string) {
                                assert.equal(token, "AccessToken");
                            }
                        };
                    };
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Intends With user id", function(done) {
            process.argv = command("node bst-intend.js Hello --userId 1234");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.userId, "1234");
                    this.start = function () {};
                    this.context = function() {
                        return {
                            user: function () {
                                return {
                                    setID: function (userId: string) {
                                        assert.equal(userId, "1234");
                                    }

                                };
                            }
                        };
                    };
                    done();
                }
            });


            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Speaks With Custom URL", function(done) {
            process.argv = command("node bst-intend.js HelloIntent --url https://proxy.bespoken.tools");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (url: string) {
                    this.url = url;
                    this.start = function() {};
                    assert.equal(this.url, "https://proxy.bespoken.tools");
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Speaks after cleaning session", function(done) {
            process.argv = command("node bst-intend.js Hello --newSession");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function () {
                    this.start = function () {
                    };
                    let sessionRemoved = false;
                    this.deleteSession = function () {
                        sessionRemoved = true;
                    };

                    this.intended = function () {
                        assert(sessionRemoved);
                        done();
                    };

                }
            });

            NodeUtil.load("../../bin/bst-intend.js");
        });

        it("Has no interaction model", function(done) {
            process.argv = command("node bst-intend.js HelloIntend");

            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (url: string) {
                    this.url = url;
                    this.start = function () { throw new Error(); };
                    assert.equal(this.url, "http://localhost:9999");

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

const command = function (command: string): Array<string> {
    return command.split(" ");
};