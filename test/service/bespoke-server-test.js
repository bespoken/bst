"use strict";
const assert = require("assert");
const bespoke_client_1 = require('../../client/bespoke-client');
const http_client_1 = require("../../client/http-client");
const bespoke_server_1 = require("../../service/bespoke-server");
describe('BespokeServerTest', function () {
    describe('ReceiveWebhook', function () {
        it('Connects and Receives Callback', function (done) {
            let server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            let bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();
            bespokeClient.onWebhookReceived = function (socket, webhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);
                server.stop();
                bespokeClient.disconnect();
                done();
            };
            let webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
        it('Handles Connection Failure', function (done) {
            this.timeout(1000);
            let server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            let bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            console.log("Test2");
            bespokeClient.connect();
            bespokeClient.onError = function (errorType, message) {
                done();
            };
            let webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });
});
//# sourceMappingURL=bespoke-server-test.js.map