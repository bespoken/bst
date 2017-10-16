import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {SinonSandbox} from "sinon";
import {RequestError} from "../external/request-error";

import {BSTProcess} from "../../lib/client/bst-config";

const globalModule = {
    Global: {
        initializeCLI: async function () {
        },
        config: function () {
            return {
                configuration: {
                    lambdaDeploy: {},
                },
                secretKey: function () {
                    return "secretKey";
                },
                sourceID() {
                    return "sourceID";
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

describe("bst", function() {
    let sandbox: SinonSandbox = null;

    beforeEach(function () {
        // Program state gets messed up by repeatedly calling it - lets dump it every time
        delete require.cache[require.resolve("commander")];

        mockery.enable();
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/core/global", globalModule);

        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
        mockery.disable();
    });

    describe("Error Handling", function() {
        beforeEach(function () {
            mockery.enable();
            mockery.warnOnUnregistered(false);
            mockery.registerMock("../lib/core/global", globalModule);
        });

        afterEach(function () {
            mockery.disable();
        });

        it("Calls proxy and gets a timeout error", function(done) {
            process.argv = command("node bst.js proxy http 9000");

            const mockProgram = sandbox.mock(require("commander"));
            let errorCalls = 0;

            const timeoutError = new RequestError("ETIMEDOUT", 505);
            timeoutError.code = "ETIMEDOUT";
            mockProgram.expects("executeSubCommand")
                .withArgs(command("node bst.js proxy http 9000"), command("proxy http 9000")).throws(timeoutError);

            mockery.registerMock("../lib/core/logging-helper", {
                "LoggingHelper": {
                    info: function (level: any, message: string) {},
                    prepareForFileLoggingAndDisableConsole: () => {},
                    error: function (level: any, message: string) {
                        errorCalls++;
                        try {
                            if (errorCalls === 1) {
                                assert.equal(message, "Could not establish connection." +
                                    " Please check your network connection and try again.");
                            }

                            if (errorCalls === 2) {
                                assert.equal(message, "If the issue persists, contact us at Bespoken:");
                            }

                            if (errorCalls === 3) {
                                assert.equal(message, "\thttps://gitter.im/bespoken/bst");
                                done();
                            }
                        } catch (error) {
                            done(error);
                        }
                    }
                }
            });

            NodeUtil.run("../../bin/bst.js");
        });

        it("Calls proxy and gets a generic error", function(done) {
            process.argv = command("node bst.js proxy http 9000");

            const mockProgram = sandbox.mock(require("commander"));
            let errorCalls = 0;

            const timeoutError = new RequestError("Generic Error", 505);
            mockProgram.expects("executeSubCommand")
                .withArgs(command("node bst.js proxy http 9000"), command("proxy http 9000")).throws(timeoutError);

            mockery.registerMock("../lib/core/logging-helper", {
                "LoggingHelper": {
                    prepareForFileLoggingAndDisableConsole: () => {},
                    info: function (level: any, message: string) {},
                    error: function (level: any, message: string) {
                        errorCalls++;
                        try {
                            if (errorCalls === 1) {
                                assert.equal(message, "Something went wrong." +
                                    " Please check your network connection and try again.");
                            }

                            if (errorCalls === 2) {
                                assert.equal(message, "If the issue persists, contact us at Bespoken:");
                            }

                            if (errorCalls === 3) {
                                assert.equal(message, "\thttps://gitter.im/bespoken/bst");
                                done();
                            }
                        } catch (error) {
                            done(error);
                        }
                    }
                }
            });

            NodeUtil.run("../../bin/bst.js");
        });
    });

    describe("proxy command", function() {
        it("Calls proxy for http", function(done) {
            process.argv = command("node bst.js proxy http 9000");

            const mockProgram = sandbox.mock(require("commander"));

            mockProgram.expects("executeSubCommand")
                .withArgs(command("node bst.js proxy http 9000"), command("proxy http 9000"));

            NodeUtil.run("../../bin/bst.js");
            setTimeout(function () {
                mockProgram.verify();
                done();
            }, 100);
        });

        it("Calls proxy for lambda", function(done) {
            process.argv = command("node bst.js proxy lambda lambda.js");
            const mockProgram = sandbox.mock(require("commander"));
            mockProgram.expects("executeSubCommand")
                .withArgs(command("node bst.js proxy lambda lambda.js"), command("proxy lambda lambda.js"));

            NodeUtil.run("../../bin/bst.js");

            setTimeout(function () {
                mockProgram.verify();
                done();
            }, 100);
        });

        describe("utter command", function() {

            it("Calls utter", function(done) {
                process.argv = command("node bst.js utter Hello World");
                const mockProgram = sandbox.mock(require("commander"));
                mockProgram.expects("executeSubCommand")
                    .withArgs(command("node bst.js utter Hello World"), command("utter Hello World"), []);

                NodeUtil.run("../../bin/bst.js");
                setTimeout(function () {
                    mockProgram.verify();
                    done();
                }, 100);
            });
        });

        describe("launch command", function() {

            it("Calls launch", function(done) {
                process.argv = command("node bst.js launch");
                const mockProgram = sandbox.mock(require("commander"));
                mockProgram.expects("executeSubCommand")
                    .withArgs(command("node bst.js launch"), command("launch"), []);

                NodeUtil.run("../../bin/bst.js");
                setTimeout(function () {
                    mockProgram.verify();
                    done();
                }, 100);
            });
        });

        describe("sleep command", function() {
            it("Calls sleep", function(done) {
                process.argv = command("node bst.js sleep Here");
                const mockProgram = sandbox.mock(require("commander"));
                mockProgram.expects("executeSubCommand")
                    .withArgs(command("node bst.js sleep Here"), command("sleep Here"), []);

                NodeUtil.run("../../bin/bst.js");
                setTimeout(function () {
                    mockProgram.verify();
                    done();
                }, 100);
            });
        });
    });

    describe("Version Check", function() {
        let originalVersion: string = null;
        beforeEach(function () {
            originalVersion = process.version;
            mockery.enable();
            mockery.warnOnUnregistered(false);
        });

        afterEach(function () {
            setVersion(originalVersion);
            mockery.disable();
        });

        it("Errors on a low version", function(done) {
            process.argv = command("node bst.js test");
            setVersion("v3.0.0");

            let errorCalls = 0;
            const mockProcess = sandbox.mock(process);
            mockProcess.expects("exit").once().withExactArgs(1);
            mockery.registerMock("../lib/core/logging-helper", {
                "LoggingHelper": {
                    prepareForFileLoggingAndDisableConsole: () => {},
                    info: function (level: any, message: string) {},
                    error: function (level: any, message: string) {
                        errorCalls++;
                        if (errorCalls === 1) {
                            assert.equal(message, "!!!!Node version must be >= 4!!!!");
                        }

                        if (errorCalls === 2) {
                            done();
                        }
                    }
                }
            });

            NodeUtil.run("../../bin/bst.js");
        });

        it("Accepts a correct version", function(done) {
            process.argv = command("node bst.js test");
            setVersion("v4.0.0");

            const mockProcess = sandbox.mock(process);
            mockProcess.expects("exit").once().withExactArgs(1);
            mockery.registerMock("../lib/core/logging-helper", {
                "LoggingHelper": {
                    info: function (level: any, message: string) {
                        console.log(message);
                    },
                    error: function (level: any, message: string) {
                        assert.fail("This should not be called!");
                    }
                }
            });

            NodeUtil.run("../../bin/bst.js");
            setTimeout(function () {
                done();
            }, 100);
        });
    });
});

const command = function (command: string): Array<string> {
    return command.split(" ");
};

const setVersion = function (version: string): void {
    Object.defineProperty(process, "version", {
        value: version
    });
};