import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";

let messageParam: string;
let constructorToken: string;
describe("SilentEchoClient", function() {
    let sandbox: sinon.SinonSandbox = null;

    const globalModule = {
        Global: {
            config: function () {
                return {
                    updateSilentEchoToken: () => {},
                    silentEchoToken: () => {},
                };
            },
        }
    };

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("../core/global", globalModule);
        sandbox = sinon.sandbox.create();
        messageParam = constructorToken = undefined;
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
        sandbox.restore();
    });

    describe("Speak", function() {
        it("Throws error when no token provided", async function() {
            const SilentEchoClient = require("../../lib/external/silent-echo").SilentEchoClient;

            try {
                await SilentEchoClient.speak("Hello world");
            } catch (error) {
                assert.equal(error.message, "Token Required");
            }
        });

        it("Works when token exists on config", async function() {

            const globalClone = Object.assign({}, globalModule);
            globalClone.Global.config = function () {
                return {
                    silentEchoToken: () => "Token",
                    updateSilentEchoToken: () => {},
                };
            };

            mockery.registerMock("../core/global", globalClone);
            mockery.registerMock("silent-echo-sdk", {
                SilentEcho: SilentEcho,
            });

            const SilentEchoClient = require("../../lib/external/silent-echo").SilentEchoClient;
            await SilentEchoClient.speak("Hello world");
            assert.equal(constructorToken, "Token");
            assert.equal(messageParam, "Hello world");
        });

        it("Works when token is provided", async function() {
            let savedToken: string;

            const globalClone = Object.assign({}, globalModule);
            globalClone.Global.config = function () {
                return {
                    silentEchoToken: () => "Token",
                    updateSilentEchoToken: (token?: string) => {
                        savedToken = token;
                    },
                };
            };

            mockery.registerMock("../core/global", globalClone);
            mockery.registerMock("silent-echo-sdk", {
                SilentEcho: SilentEcho,
            });

            const SilentEchoClient = require("../../lib/external/silent-echo").SilentEchoClient;
            await SilentEchoClient.speak("Hello world", "newToken");
            assert.equal(savedToken, "newToken");
            assert.equal(constructorToken, "newToken");
            assert.equal(messageParam, "Hello world");
        });

        it("Works when token is provided but no Config is present", async function() {
            const globalClone = Object.assign({}, globalModule);
            globalClone.Global.config = function () {
                return undefined;
            };

            mockery.registerMock("../core/global", globalClone);
            mockery.registerMock("silent-echo-sdk", {
                SilentEcho: SilentEcho,
            });

            const SilentEchoClient = require("../../lib/external/silent-echo").SilentEchoClient;
            await SilentEchoClient.speak("Hello world", "newToken");
            assert.equal(constructorToken, "newToken");
            assert.equal(messageParam, "Hello world");
        });
    });
});

class SilentEcho {
    public constructor(token: string) {
        constructorToken = token;
    }

    public message = (utterance: string) => {
        messageParam = utterance;
    }
}