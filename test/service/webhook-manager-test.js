/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
"use strict";
var webhook_manager_1 = require("../../service/webhook-manager");
var http_client_1 = require("../../client/http-client");
describe('WebhookManager', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var manager = new webhook_manager_1.WebhookManager();
            manager.onWebhookReceived = function (request) {
                console.log("NodeID: " + request.nodeID());
                done();
            };
            manager.start();
            var client = new http_client_1.HTTPClient();
            client.post("Test");
        });
    });
});
