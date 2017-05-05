import * as assert from "assert";
import * as mockery from "mockery";
import {RequestError} from "./request-error";

describe("Spokes", function() {
    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("Verifies if uuid exists", function() {
        it("Returns true when it doesn't", async function() {
            mockery.registerMock("request-promise-native", {
                get: function(options) {
                    throw new RequestError("id not found", 404);
                }
            });

            const SpokesClient = require("../../lib/external/spokes").SpokesClient;

            const spokes = new SpokesClient("id", "secretKey");
            const response = await spokes.verifyUUIDisNew();
            assert(response);
        });

        it("Returns false when id exists", async function() {
            mockery.registerMock("request-promise-native", {
                get: function(options) {
                    return {};
                }
            });
            const SpokesClient = require("../../lib/external/spokes").SpokesClient;

            const spokes = new SpokesClient("id", "secretKey");
            const response = await spokes.verifyUUIDisNew();
            assert(!response);
        });

        it("throws error when unexpected error happens", async function() {
            mockery.registerMock("request-promise-native", {
                get: function(options) {
                    throw new RequestError("crash happened", 505);
                }
            });
            const SpokesClient = require("../../lib/external/spokes").SpokesClient;

            const spokes = new SpokesClient("id", "secretKey");
            try {
                await spokes.verifyUUIDisNew();
                // we shouldn't reach here
                assert.equal(true, false);
            } catch (error) {
                assert.equal(error.statusCode, 505);
            }
        });
    });

   describe("Returns payload", function() {
       it("with values from constructor", async function() {
           mockery.registerMock("request-promise-native", {
               post: function(options) {
                   return options;
               }
           });
           const SpokesClient = require("../../lib/external/spokes").SpokesClient;

           const spokes = new SpokesClient("id", "secretKey");
           const response = await spokes.createPipe();
           const expectedResponse = {
               uri: "https://api.bespoken.link/pipe",
               headers: {
                   "x-access-token": "4772616365-46696f72656c6c61"
               },
               body: {
                   uuid: "secretKey",
                   diagnosticsKey: null,
                   endPoint: {
                       name: "id"
                   },
                   http: {
                       url: "https://proxy.bespoken.tools",
                   },
                   path: "/",
                   pipeType: "HTTP",
                   proxy: true
               },
               json: true,
               timeout: 30000,
               // We add the endpoint on actual call to createPipe
               endPoint: {
                   name: "id"
               },
           };

           assert.deepEqual(response, expectedResponse);
       });
    });
});