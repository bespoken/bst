import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {VirtualDeviceClient} from "../../lib/external/virtual-device";

let messageParam: string;
let constructorToken: string;
describe("VirtualDeviceClient", function() {
    let sandbox: sinon.SinonSandbox = null;

    const globalModule = {
        Global: {
            config: function () {
                return {
                    updateVirtualDeviceToken: () => {
                    },
                    virtualDeviceToken: () => {
                    },
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

    describe("Speak", function () {
        it("Throws error when no token provided", async function () {
            const VirtualDeviceClient = require("../../lib/external/virtual-device").VirtualDeviceClient;

            try {
                await VirtualDeviceClient.speak("Hello world");
            } catch (error) {
                assert.equal(error.message, "Token Required");
            }
        });

        it("Works when token exists on config", async function () {

            const globalClone = Object.assign({}, globalModule);
            globalClone.Global.config = function () {
                return {
                    virtualDeviceToken: () => "Token",
                    updateVirtualDeviceToken: () => {
                    },
                };
            };

            mockery.registerMock("../core/global", globalClone);
            mockery.registerMock("virtual-device-sdk", {
                VirtualDevice: VirtualDevice,
            });

            const VirtualDeviceClient = require("../../lib/external/virtual-device").VirtualDeviceClient;
            await VirtualDeviceClient.speak("Hello world");
            assert.equal(constructorToken, "Token");
            assert.equal(messageParam, "Hello world");
        });

        it("Works when token is provided", async function () {
            let savedToken: string;

            const globalClone = Object.assign({}, globalModule);
            globalClone.Global.config = function () {
                return {
                    virtualDeviceToken: () => "Token",
                    updateVirtualDeviceToken: (token?: string) => {
                        savedToken = token;
                    },
                };
            };

            mockery.registerMock("../core/global", globalClone);
            mockery.registerMock("virtual-device-sdk", {
                VirtualDevice: VirtualDevice,
            });

            const VirtualDeviceClient = require("../../lib/external/virtual-device").VirtualDeviceClient;
            await VirtualDeviceClient.speak("Hello world", "newToken");
            assert.equal(savedToken, "newToken");
            assert.equal(constructorToken, "newToken");
            assert.equal(messageParam, "Hello world");
        });

        it("Works when token is provided but no Config is present", async function () {
            const globalClone = Object.assign({}, globalModule);
            globalClone.Global.config = function () {
                return undefined;
            };

            mockery.registerMock("../core/global", globalClone);
            mockery.registerMock("virtual-device-sdk", {
                VirtualDevice: VirtualDevice,
            });

            const VirtualDeviceClient = require("../../lib/external/virtual-device").VirtualDeviceClient;
            await VirtualDeviceClient.speak("Hello world", "newToken");
            assert.equal(constructorToken, "newToken");
            assert.equal(messageParam, "Hello world");
        });
    });

    describe("renderResult", function () {
        it("Renders Transcript correctly", function () {
            const virtualDeviceResponse = {
                transcript: "Transcript Text",
            } as any;

            let expectedRenderedResult = "Transcript:\nTranscript Text\n\n";

            assert.equal(VirtualDeviceClient.renderResult(virtualDeviceResponse), expectedRenderedResult);
        });

        it("Renders Stream correctly", function () {
            const virtualDeviceResponse = {
                streamURL: "https://stream.url",
            } as any;

            let expectedRenderedResult = "Stream:\nhttps://stream.url\n\n";

            assert.equal(VirtualDeviceClient.renderResult(virtualDeviceResponse), expectedRenderedResult);

        });

        describe("Renders Card correctly", function () {
            const virtualDeviceResponse = {
                card: {
                    mainTitle: "Title"
                },
            } as any;

            let expectedRenderedResult = "Card:\nTitle\n";

            it("Renders Title", function () {
                assert.equal(VirtualDeviceClient.renderResult(virtualDeviceResponse), expectedRenderedResult);
            });

            it("Renders SubTitle", function () {
                virtualDeviceResponse.card.subTitle = "SubTitle";
                expectedRenderedResult += "SubTitle\n";
                assert.equal(VirtualDeviceClient.renderResult(virtualDeviceResponse), expectedRenderedResult);
            });

            it("Renders TextField", function () {
                virtualDeviceResponse.card.textField = "TextField";
                expectedRenderedResult += "TextField\n";
                assert.equal(VirtualDeviceClient.renderResult(virtualDeviceResponse), expectedRenderedResult);
            });

            it("Renders ImageUrl", function () {
                virtualDeviceResponse.card.imageURL = "http://image.url";
                expectedRenderedResult += "http://image.url\n";
                assert.equal(VirtualDeviceClient.renderResult(virtualDeviceResponse), expectedRenderedResult);
            });
        });
    });
});

class VirtualDevice {
    public constructor(token: string) {
        constructorToken = token;
    }

    public message = (utterance: string) => {
        messageParam = utterance;
    }
}
