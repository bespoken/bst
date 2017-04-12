import * as assert from "assert";
import * as mockery from "mockery";

describe("Source Name Generator", function() {

    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.warnOnReplace(false);
    mockery.registerMock("request-promise-native", {
        get: function () {
            return `{
                "id": "id",
                "secretKey": "secretKey"
            }`;
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
});