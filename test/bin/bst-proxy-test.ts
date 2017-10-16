import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {SinonSandbox} from "sinon";
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

describe("bst-proxy", function() {
    let sandbox: SinonSandbox = null;

    let mockModule: any = {
        BSTProxy: {
            http: function (targetPort: number) {
                assert.equal(targetPort, 9000);
                return this;
            },

            lambda: function (lambdaFile: string) {
                assert.equal(lambdaFile, "lambda.js");
                return this;
            },

            cloudFunction: function (functionFile: string, functionName: string) {
                assert.equal(functionFile, "function.js");
                assert.equal(functionName, "handler");
                return this;
            }
        }
    };
    let mockProxy: any = mockModule.BSTProxy;

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/client/bst-proxy", mockModule);
        mockery.registerMock("../lib/core/global", globalModule);
        mockery.registerMock("../lib/core/logging-helper", {
            LoggingHelper: {
                setVerbose: () => {}
            }
        });
        sandbox = sinon.sandbox.create();
        sandbox.stub(process, "exit", function () {}); // Ignore exit()
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("Help command", function() {
        let originalFunction: any = null;
        beforeEach (function () {
            originalFunction = process.stdout.write;
        });

        afterEach (function () {
            process.stdout.write = originalFunction;
        });

        it("Prints help with no-args", function(done) {
            process.argv = command("node bst-proxy.js");

            // Confirm the help prints out
            (<any> process.stdout).write = function (data: Buffer) {
                let dataString: string = data.toString();
                if (dataString.indexOf("Usage") !== -1) {
                    done();
                }
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });

    describe("http command", function() {
        it("Calls HTTP proxy", function(done) {
            process.argv = command("node bst-proxy.js http 9000");
            mockProxy.start = function () {
                done();
            };
            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls HTTP proxy with verbose option", function(done) {
            process.argv = command("node bst-proxy.js http 9000 --verbose");
            mockProxy.start = function () {
                done();
            };
            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls HTTP proxy with options", function(done) {
            process.argv = command("node bst-proxy.js --secure --pithy --bstHost localhost --bstPort 9000 --targetDomain 0.0.0.0 http 9000");

            let pithyCalled = false;
            sandbox.stub(console, "log", function (log: string) {
                if (log.indexOf("Disabling verbose logging") !== -1) {
                    pithyCalled = true;
                }
            });

            let optionsSet = false;
            let domainSet = false;
            let security = false;
            mockProxy.start = function () {
                assert(optionsSet, "Options not set");
                assert(domainSet, "Domain not set");
                assert(pithyCalled, "Pithy must be set");
                assert(security, "Security must be set");
                done();
            };

            mockProxy.bespokenServer = function (host: string, port: number) {
                assert.equal(host, "localhost");
                assert.equal(port, "9000");
                optionsSet = true;
            };

            mockProxy.targetDomain = function (domain: string) {
                assert.equal(domain, "0.0.0.0");
                domainSet = true;
            };

            mockProxy.activateSecurity = function () {
                security = true;
            };


            NodeUtil.load("../../bin/bst-proxy.js");
        });

    });

    describe("function command", function() {
        it("Calls Function proxy", function(done) {
            process.argv = command("node bst-proxy.js function function.js handler");
            mockProxy.start = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls Function proxy with verbose option", function(done) {
            process.argv = command("node bst-proxy.js function function.js handler --verbose");
            mockProxy.start = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls function proxy with options", function(done) {
            process.argv = command("node bst-proxy.js --bstHost localhost2 --bstPort 9001 function function.js handler");
            let optionsSet = false;
            mockProxy.start = function () {
                if (!optionsSet) {
                    assert.fail("Options not set");
                }
                done();
            };

            mockProxy.bespokenServer = function (host: string, port: number) {
                assert.equal(host, "localhost2");
                assert.equal(port, "9001");
                optionsSet = true;
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });

    describe("lambda command", function() {
        it("Calls Lambda proxy", function(done) {
            process.argv = command("node bst-proxy.js lambda lambda.js");
            mockProxy.start = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls Lambda proxy with functionName", function(done) {
            process.argv = command("node bst-proxy.js lambda lambda.js myHandler");
            mockProxy.start = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls Lambda proxy with verbose option", function(done) {
            process.argv = command("node bst-proxy.js lambda lambda.js --verbose");
            mockProxy.start = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Calls Lambda proxy with options", function(done) {
            process.argv = command("node bst-proxy.js --bstHost localhost2 --bstPort 9001 lambda lambda.js");
            let optionsSet = false;
            mockProxy.start = function () {
                if (!optionsSet) {
                    assert.fail("Options not set");
                }
                done();
            };

            mockProxy.bespokenServer = function (host: string, port: number) {
                assert.equal(host, "localhost2");
                assert.equal(port, "9001");
                optionsSet = true;
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });

    describe("stop command", function() {
        it("Stops running proxy", function(done) {
            process.argv = command("node bst-proxy.js stop");
            sandbox.stub(console, "log", function (data: Buffer) {
                if (data !== undefined) {
                    if (data.toString().startsWith("Proxy process stopped.")) {
                        done();
                    }
                }
            });
            mockery.registerMock("../lib/core/global", {
                Global: {
                    initializeCLI: async function () {},
                    running: function () {
                        return {
                            kill: function () {
                                return true;
                            }
                        };
                    }
                }
            });

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Fails to stop running proxy", function(done) {
            process.argv = command("node bst-proxy.js stop");
            sandbox.stub(console, "error", function (data: Buffer) {
                if (data !== undefined) {
                    if (data.toString().startsWith("Proxy process failed to stop.")) {
                        done();
                    }
                }
            });
            mockery.registerMock("../lib/core/global", {
                Global: {
                    initializeCLI: async function () {},
                    running: function () {
                        return {
                            kill: function () {
                                return false;
                            }
                        };
                    }
                }
            });

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Stops without anything running", function(done) {
            process.argv = command("node bst-proxy.js stop");
            sandbox.stub(console, "log", function (data: Buffer) {
                if (data !== undefined) {
                    if (data.toString().startsWith("We do not see any proxy running")) {
                        done();
                    }
                }
            });
            mockery.registerMock("../lib/core/global", {
                Global: {
                    initializeCLI: async function () {},
                    running: function (): BSTProcess {
                        return null;
                    }
                }
            });

            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};