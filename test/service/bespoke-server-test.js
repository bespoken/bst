/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />
"use strict";
var assert = require("assert");
var bespoke_client_1 = require("../../client/bespoke-client");
var http_client_1 = require("../../client/http-client");
var bespoke_server_1 = require("../../service/bespoke-server");
describe("BespokeServerTest", function () {
    describe("ReceiveWebhook", function () {
        it("Connects and Receives Callback", function (done) {
            // Start the server
            var server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            // Connect a client
            var bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();
            bespokeClient.onWebhookReceived = function (socket, webhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);
                bespokeClient.disconnect();
                server.stop(function () {
                    done();
                });
            };
            var webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
        it("Handles Connection Failure", function (done) {
            this.timeout(1000);
            // Start the server
            var server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            // Connect a client
            var bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            console.log("Test2");
            bespokeClient.connect();
            bespokeClient.onError = function () {
                bespokeClient.disconnect();
                server.stop(null);
                done();
            };
            var webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });
});
