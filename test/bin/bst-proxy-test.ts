/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import SinonSandbox = Sinon.SinonSandbox;
import {BSTProcess} from "../../lib/client/bst-config";

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

            cloudFunction: function (functionFile: string) {
                assert.equal(functionFile, "function.js");
                return this;
            }
        }
    };
    let mockProxy: any = mockModule.BSTProxy;

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/client/bst-proxy", mockModule);
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

        it("Calls HTTP proxy with options", function(done) {
            process.argv = command("node bst-proxy.js --pithy --bstHost localhost --bstPort 9000 --targetDomain 0.0.0.0 http 9000");

            let pithyCalled = false;
            sandbox.stub(console, "log", function (log: string) {
                if (log.indexOf("Disabling verbose logging") !== -1) {
                    pithyCalled = true;
                }
            });

            let optionsSet = false;
            let domainSet = false;
            mockProxy.start = function () {
                assert(optionsSet, "Options not set");
                assert(domainSet, "Domain not set");
                assert(pithyCalled, "Pithy must be set");
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


            NodeUtil.load("../../bin/bst-proxy.js");
        });

    });

    describe("function command", function() {
        it("Calls Function proxy", function(done) {
            process.argv = command("node bst-proxy.js function function.js");
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

    describe("lambda command", function() {
        it("Calls Lambda proxy", function(done) {
            process.argv = command("node bst-proxy.js lambda lambda.js");
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
                    initializeCLI: function () {},
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
                    initializeCLI: function () {},
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
                    initializeCLI: function () {},
                    running: function (): BSTProcess {
                        return null;
                    }
                }
            });

            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });


    describe("urlgen", function() {
        it("Calls urlgen", function(done) {
            process.argv = command("node bst-proxy.js urlgen http://jpk.com/test");

            mockProxy.urlgen = function (url: string) {
                assert.equal(url, "http://jpk.com/test");
                done();
            };

            NodeUtil.load("../../bin/bst-proxy.js");
        });

        it("Prints the BST URL", function(done) {
            process.argv = command("node bst-proxy.js urlgen http://jpk.com/test");
            mockProxy.urlgen = function (url: string) {
                return url;
            };

            let count = 0;
            // Confirm the help prints out
            sandbox.stub(console, "log", function (data: Buffer) {
                count++;
                if (data !== undefined) {
                    console.error("Date: " + data.toString());
                }
                if (count === 3 && data.toString().indexOf("http") !== -1) {
                    done();
                }
            });

            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};