/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from "../../client/bespoke-client";
import {Node} from "../../server/node";
import {NodeManager} from "../../server/node-manager";
import {WebhookManager} from "../../server/webhook-manager";
import {WebhookRequest} from "../../core/webhook-request";
import {HTTPClient} from "../../client/http-client";
import {BespokeServer} from "../../server/bespoke-server";
import {Socket} from "net";
import {NetworkErrorType} from "../../core/global";

describe("BespokeServerTest", function() {
    describe("ReceiveWebhook", function() {
        it("Connects and Receives Callback", function(done) {
            // Start the server
            let server = new BespokeServer(8000, 9000);
            server.start();

            // Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();

            bespokeClient.onWebhookReceived = function(socket: Socket, webhookRequest: WebhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);
                bespokeClient.disconnect();
                server.stop(function () {
                    done();
                });
            };

            let webhookCaller = new HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });

        it("Handles Connection Failure", function(done) {
            this.timeout(1000);
            // Start the server
            let server = new BespokeServer(8000, 9000);
            server.start();

            // Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
            console.log("Test2");
            bespokeClient.connect();
            bespokeClient.onError = function() {
                bespokeClient.disconnect();
                server.stop(null);
                done();
            };

            let webhookCaller = new HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });

});