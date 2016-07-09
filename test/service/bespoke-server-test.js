/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />
"use strict";
var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var http_client_1 = require("../../client/http-client");
var bespoke_server_1 = require("../../service/bespoke-server");
describe('BespokeServerTest', function () {
    describe('ReceiveWebhook', function () {
        it('ConnectClientAndReceiveWebhook', function (done) {
            //Start the server
            var server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            //Connect a client
            var bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();
            bespokeClient.onWebhookReceived = function (socket, webhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);
                server.stop();
                bespokeClient.disconnect();
                done();
            };
            var webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });
    //describe('Receive Webhook Failure', function() {
    //    it('Connects And Then Fails', function(done) {
    //        //Start the server
    //        let server = new BespokeServer(8000, 9000);
    //        server.start();
    //
    //        //Connect a client
    //        let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
    //        bespokeClient.connect();
    //
    //        let webhookCaller = new HTTPClient();
    //        webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
    //
    //        setTimeout(function () {
    //            done();
    //        }, 1500);
    //    });
    //});
});
