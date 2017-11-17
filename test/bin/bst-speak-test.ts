import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import {SinonSandbox} from "sinon";

describe("bst-speak", function() {
    const tokenWarning = "Your token is saved, you can now use this command without providing a token";

    let globalModule = {
        Global: {
            initializeCLI: async function () {

            },
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
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("Speak command", function() {
        it("Send message without token warning", function() {
            return new Promise((resolve, reject) => {
                process.argv = command("node bst-speak.js Hello");
                mockery.registerMock("../lib/external/virtual-device", {
                    VirtualDeviceClient: {
                        speak: function() {
                            return {
                                transcript: "Response"
                            };
                        },
                        renderResult: function (result: any) {
                            try {
                                assert.equal(result.transcript, "Response");
                            } catch (error) {
                                reject(error);
                            }
                            return "Response Rendered";
                        },
                    }
                });

                let flagResponse = false;
                let flagToken = true;
                    sandbox.stub(console, "log", function(data: Buffer) {
                        if (data && data.includes(tokenWarning)) {
                            flagToken = false;
                        }

                        if (data && data.includes("Response Rendered")) {
                            flagResponse = true;
                        }

                        if (flagToken && flagResponse) {
                            resolve();
                        }
                    });
                NodeUtil.load("../../bin/bst-speak.js");
            });
        });

        it("Throws missing token error", function() {
            return new Promise((resolve, reject) => {
                let tokenErrorWasPrinted = false;
                process.argv = command("node bst-speak.js Hello");
                mockery.registerMock("../lib/external/virtual-device", {
                    VirtualDeviceClient: {
                        speak: function() {
                            throw new Error("Token Required");
                        },
                        renderResult: function () {
                          return "";
                        },
                    }
                });

                sandbox.stub(process, "exit", function(exitCode: number) {
                    try {
                        assert.equal(exitCode, 0);
                        assert.equal(true, tokenErrorWasPrinted,  "Warning was not printed");
                    } catch (error) {
                        reject(error);
                    }
                    resolve();
                });

                sandbox.stub(console, "log", function(data: Buffer) {
                    const initialString = "You need a token for this option to work, get it here:";
                    if (data !== undefined && data.indexOf(initialString) !== -1) {
                        tokenErrorWasPrinted = true;
                    }
                });
                NodeUtil.load("../../bin/bst-speak.js");
            });
        });

        it("Send message with token warning when provided", function() {
            return new Promise((resolve, reject) => {

                process.argv = command("node bst-speak.js --token Token Hello");
                mockery.registerMock("../lib/external/virtual-device", {
                    VirtualDeviceClient: {
                        speak: function() {
                            return {
                                transcript: "Response"
                            };
                        },
                        renderResult: function (result: any) {
                            try {
                                assert.equal(result.transcript, "Response");
                            } catch (error) {
                                reject(error);
                            }
                            return "Response Rendered";
                        },
                    }
                });

                let flagResponse = false;
                let flagToken = false;
                sandbox.stub(console, "log", function(data: Buffer) {
                    if (data !== undefined && data.includes(tokenWarning)) {
                        flagToken = true;
                    }

                    if (data !== undefined && data.includes("Response Rendered")) {
                        flagResponse = true;
                    }

                    if (flagResponse && flagToken) {
                        resolve();
                    }
                });
                NodeUtil.load("../../bin/bst-speak.js");
            });
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};
