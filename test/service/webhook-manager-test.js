"use strict";
var assert = require("assert");
var webhook_manager_1 = require("../../service/webhook-manager");
var http_client_1 = require("../../client/http-client");
describe('WebhookManager', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var manager = new webhook_manager_1.WebhookManager(8080);
            manager.onWebhookReceived = function (request) {
                console.log("NodeID: " + request.nodeID());
                assert.equal("10", request.nodeID());
                assert.equal("Test", request.body);
                done();
            };
            manager.start();
            var client = new http_client_1.HTTPClient();
            client.post("localhost", 8080, "/test?node-id=10", "Test");
        });
    });
});
//# sourceMappingURL=webhook-manager-test.js.map