import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import {SinonSandbox} from "sinon";

describe("bst-test", function() {

    let globalModule = {
        Global: {
            initializeCLI: sinon.spy(async function () {

            }),
            config: function () {
                return { sourceID: () => "mySource" };
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
        globalModule.Global.initializeCLI.reset();
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("test command", function() {
        it("call initializeCLI with false", function() {
            return new Promise((resolve, reject) => {

                process.argv = command("node bst-test.js");
                mockery.registerMock("skill-testing-ml", {
                        CLI: function() {
                            return {
                                run: async function () {
                                }
                            };
                        },
                        ConfigurationKeys: [
                            {
                                key: "platform",
                                text: "Set platform"
                            },
                            {
                                key: "type",
                                text: "Set type"
                            }
                        ]
                });
                NodeUtil.load("../../bin/bst-test.js");
                assert.equal(globalModule.Global.initializeCLI.getCall(0).args[0], false);
                resolve();
            });
        });

        it("call with parameters", function() {
            return new Promise((resolve, reject) => {
                const mockRun = function(a, b) {
                    assert.equal(b.platform, "google");
                    resolve();
                };
                const mockCli = function() {
                    return {
                        run: mockRun
                    };
                };
                const skillTestingMock = {
                    CLI: mockCli,
                    ConfigurationKeys: [
                        {
                            key: "platform",
                            text: "Set platform"
                        },
                        {
                            key: "type",
                            text: "Set type"
                        }
                    ]
                };
                mockery.registerMock("skill-testing-ml", skillTestingMock);
                process.argv = command("node bst-test.js --platform google");
                NodeUtil.load("../../bin/bst-test.js");
                assert.equal(globalModule.Global.initializeCLI.getCall(0).args[0], false);
            });
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};
