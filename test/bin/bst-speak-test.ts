import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import {SinonSandbox} from "sinon";

describe("bst-utter", function() {
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
        it("Send message without token warning", function(done) {
            process.argv = command("node bst-speak.js Hello");
            mockery.registerMock("../lib/external/silent-echo", {
                SilentEchoClient: {
                    speak: function() {
                        return {
                            transcript: "Response"
                        };
                    },
                    renderResult: function (result: any) {
                        try {
                            assert.equal(result.transcript, "Response");
                        } catch (error) {
                            done(error);
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
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Throws missing token error", function(done) {
            process.argv = command("node bst-speak.js Hello");
            mockery.registerMock("../lib/external/silent-echo", {
                SilentEchoClient: {
                    speak: function() {
                        throw new Error("Token Required");
                    },
                    renderResult: function (result: any) {
                      return "";
                    },
                }
            });

            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
            });

            sandbox.stub(console, "log", function(data: Buffer) {
                const initialString = "You need a token for this option to work, get it here:";
                if (data !== undefined && data.indexOf(initialString) !== -1) {
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Send message with token warning when provided", function(done) {
            process.argv = command("node bst-speak.js --token Token Hello");
            mockery.registerMock("../lib/external/silent-echo", {
                SilentEchoClient: {
                    speak: function() {
                        return {
                            transcript: "Response"
                        };
                    },
                    renderResult: function (result: any) {
                        try {
                            assert.equal(result.transcript, "Response");
                        } catch (error) {
                            done(error);
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
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};