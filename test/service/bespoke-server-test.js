/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var http_client_1 = require("../../client/http-client");
var bespoke_server_1 = require("../../service/bespoke-server");
describe('BespokeServerTest', function () {
    describe('ReceiveWebhook', function () {
        it('Should Connect and Receive Data', function (done) {
            //Start the server
            var server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            //Connect a client
            var bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000);
            bespokeClient.connect();
            bespokeClient.onWebhookReceived = function (webhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);
                done();
            };
            var webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });
});
//# sourceMappingURL=bespoke-server-test.js.map