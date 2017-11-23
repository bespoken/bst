import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {SinonSandbox} from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";


describe("bst-launch", function() {
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

    describe("Launch command", function() {
        it("Prints help with help parameter", function(done) {
            process.argv = command("node bst-launch.js -h");

            const mockProgram = sandbox.mock(require("commander"));
            mockProgram.expects("outputHelp").once();

            const mockProcess = sandbox.mock(process);
            mockProcess.expects("exit").once().withExactArgs(0);

            NodeUtil.load("../../bin/bst-launch.js");

            setTimeout(function () {
                try {
                    mockProgram.verify();
                    mockProcess.verify();
                    done();
                } catch (assertionError) {
                    done(assertionError);
                }
            }, 100);
        });

        it("Prints error if launch throws error", function(done) {
            process.argv = command("node bst-launch.js");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function () {
                    this.start = function() {};

                    this.launched = function (callback: any) {
                        callback("error", null, null);
                    };
                }
            });

            sandbox.stub(console, "error", function(data: Buffer) {
                if (data && data.indexOf("Error:") !== -1) {
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request without parameters", function(done) {
            process.argv = command("node bst-launch.js");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function () {
                    this.start = function() {};

                    this.launched = function (callback: any) {
                        callback(null, {"request": "test"}, {"response": "test"});
                    };
                }
            });

            sandbox.stub(console, "log", function(data: Buffer) {
                if (data && data.indexOf("Response:") !== -1) {
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request with Application ID", function(done) {
            process.argv = command("node bst-launch.js --appId 1234567890");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    this.launched = function (callback: any) {};
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request With Application ID Succinct Syntax", function(done) {
            process.argv = command("node bst-launch.js Hello -a 1234567890");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    assert.equal(applicationID, "1234567890");
                    this.start = function () {};
                    this.launched = function (callback: any) {};

                    done();
                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request With access token", function(done) {
            process.argv = command("node bst-launch.js -a 1234567890 -t AccessToken");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.accessToken, "AccessToken");
                    this.start = function () {};
                    this.launched = function (callback: any) {};
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

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request With user id", function(done) {
            process.argv = command("node bst-launch.js --userId 123456");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.userId, "123456");
                    this.start = function () {};
                    this.launched = function (callback: any) {};
                    this.context = function() {
                        return {
                            user: function () {
                                return {
                                    setID: function (userId: string) {
                                        assert.equal(userId, "123456");
                                    }

                                };
                            }
                        };
                    };
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request With user id abbreviated", function(done) {
            process.argv = command("node bst-utter.js -U 123456");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (skillURL: any, interactionModel: any, intentSchemaFile: any, sampleUtterancesFile: any, applicationID: string) {
                    const commander = require("commander");
                    assert.equal(commander.userId, "123456");
                    this.start = function () {};
                    this.launched = function (callback: any) {};
                    this.context = function() {
                        return {
                            user: function () {
                                return {
                                    setID: function (userId: string) {
                                        assert.equal(userId, "123456");
                                    }

                                };
                            }
                        };
                    };
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
        });

        it("Generates a launch request With Custom URL", function(done) {
            process.argv = command("node bst-launch.js --url https://proxy.bespoken.tools");
            mockery.registerMock("../lib/client/bst-virtual-alexa", {
                BSTVirtualAlexa: function (url: string) {
                    this.start = function() {};
                    this.launched = function (callback: any) {};
                    assert.equal(url, "https://proxy.bespoken.tools");
                    done();

                }
            });

            NodeUtil.load("../../bin/bst-launch.js");
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

            process.argv = command("node bst-launch.js");
            // Prints out error if no process running
            globalModule.Global.running = function () {
                return null;
            };

            NodeUtil.load("../../bin/bst-launch.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};