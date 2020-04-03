import * as assert from "assert";
import * as mockery from "mockery";

describe("Source Name Generator", function() {

    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.warnOnReplace(false);
    mockery.registerMock("request-promise-native", {
        get: function () {
            return {
                "id": "id",
                "secretKey": "secretKey"
            };
        },
        post: function (request) {
            return request;
        }
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    const SourceNameGenerator = require("../../lib/external/source-name-generator").SourceNameGenerator;

    it("Returns payload", async function() {
        const sourceNameGenerator = new SourceNameGenerator();
        const response = await sourceNameGenerator.callService();
        assert.equal(response.id, "id");
        assert.equal(response.secretKey, "secretKey");
    });

    it("Creates a new source", async function() {
        const sourceNameGenerator = new SourceNameGenerator();
        const response = await sourceNameGenerator.createDashboardSource("id", "secretKey");
        const expectedResponse = {
            uri: "https://source-api.bespoken.tools/v1/createSource",
            headers: {
            },
            body: {
                source: {
                    id: "id",
                    secretKey: "secretKey",
                    name: "id",
                    liveDebug: true,
                },
            },
            json: true,
            timeout: 30000
        };
        assert.deepEqual(response, expectedResponse);
    });

    it("Creates a new source with a proxy", async function() {
        process.env.HTTPS_PROXY = "http://127.0.0.1:1234";
        const sourceNameGenerator = new SourceNameGenerator();
        const response = await sourceNameGenerator.createDashboardSource("id", "secretKey");
        const expectedResponse = {
            uri: "https://source-api.bespoken.tools/v1/createSource",
            headers: {
            },
            body: {
                source: {
                    id: "id",
                    secretKey: "secretKey",
                    name: "id",
                    liveDebug: true,
                },
            },
            json: true,
            timeout: 30000,
            "agent": {
                "_events": {},
                "_eventsCount": 0,
                "maxFreeSockets": 1,
                "maxSockets": 1,
                "proxy": {
                    "host": "127.0.0.1",
                    "hostname": "127.0.0.1",
                    "href": "http://127.0.0.1:1234/",
                    "port": 1234,
                    "protocol": "http:",
                    "slashes": true,
                },
                "requests": {},
                "secureProxy": false,
                "sockets": {},
            }
        };
        assert.deepEqual(response.body, expectedResponse.body);
        assert.equal(response.uri, expectedResponse.uri);
        assert.equal(response.agent.proxy.host, expectedResponse.agent.proxy.host);
        assert.equal(response.agent.proxy.port, expectedResponse.agent.proxy.port);

        process.env.HTTPS_PROXY = undefined;
    });
});