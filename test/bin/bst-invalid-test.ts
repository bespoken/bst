import * as mockery from "mockery";
import * as sinon from "sinon";
import {SinonSandbox} from "sinon";
import {NodeUtil} from "../../lib/core/node-util";

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
            };
        },
        version: function () {
            return "0.0.0";
        },
    }
};

describe("bst commands", function() {
    let sandbox: SinonSandbox = null;
    let originalFunction: any = null;
    let dataString: string = "";
    let resultPattern: string = "";
    let mochaDone: MochaDone = null;

    let collectError = function (buffer: Buffer|string) {
        if (buffer instanceof Buffer) {
            dataString = dataString + buffer.toString();
        } else {
            dataString = dataString + buffer;
        }
    };

    let checkResult = function() {
        process.stdout.write = originalFunction;

        if (dataString.indexOf(resultPattern) !== -1) {
            mochaDone();
        } else {
            mochaDone(new Error(resultPattern + " was not in the output!"));
        }
    };

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/core/global", globalModule);

        sandbox = sinon.sandbox.create();
        sandbox.stub(process, "exit", function (n: number) {}); // Ignore exit()
        originalFunction = process.stdout.write;
        dataString = "";
        (<any> process.stderr).write = collectError;
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    this.timeout(3000);

    describe("Invalid deploy command", function() {
        it("Prints error with invalid command", function(done) {
            process.argv = command("node bst-deploy.js foo");
            resultPattern = "unknown command";
            mochaDone = done;
            setTimeout(checkResult, 1000);
            NodeUtil.load("../../bin/bst-deploy.js");
        });

        it("Prints error with missing mandatory arg", function(done) {
            process.argv = command("node bst-deploy.js lambda");
            resultPattern = "missing required argument lambda-folder";
            mochaDone = done;
            setTimeout(checkResult, 1000);
            NodeUtil.load("../../bin/bst-deploy.js");
        });
    });

    describe("Invalid proxy command", function() {
        beforeEach(function () {
            let mockProxy: any = {
                BSTProxy: {
                    lambda: function () {
                        return this;
                    },
                    start: function () {
                        return this;
                    }
                }
            };

            mockery.registerMock("../lib/client/bst-proxy", mockProxy);
        });

        it("Prints error with invalid command", function(done) {
            process.argv = command("node bst-proxy.js foo");
            resultPattern = "unknown command";
            mochaDone = done;
            setTimeout(checkResult, 1000);
            NodeUtil.load("../../bin/bst-proxy.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};