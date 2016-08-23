/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";
import {WebhookManager} from "../../lib/server/webhook-manager";
import {WebhookRequest} from "../../lib/core/webhook-request";
import {HTTPClient} from "../../lib/core/http-client";
import {BespokeServer} from "../../lib/server/bespoke-server";
import {Socket} from "net";
import {NetworkErrorType} from "../../lib/core/global";

describe("BespokeServerTest", function() {
    describe("ReceiveWebhook", function() {
        it("Connects and Receives Callback", function(done) {
            this.timeout(10000);
            // Start the server
            let server = new BespokeServer(8010, 9010);
            server.start();

            // Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9010, 9011);
            bespokeClient.connect();

            bespokeClient.onWebhookReceived = function(socket: Socket, webhookRequest: WebhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);

                // Dummy response from a non-existent HTTP service
                let response = "HTTP/1.1 200 OK\r\nContent-Length: 15\r\n\r\n";
                response += JSON.stringify({"data": "test"});
                bespokeClient.send(response);
            };

            let webhookCaller = new HTTPClient();
            webhookCaller.post("localhost", 8010, "/test?node-id=JPK", "Test", function (data: Buffer) {
                console.log("data: " + data.toString());
                let json = JSON.parse(data.toString());
                assert.equal(json.data, "test");
                bespokeClient.disconnect();
                server.stop(function () {
                    done();
                });
            });
        });

        it("Handles Connection Failure", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);
            server.start();

            // Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();
            bespokeClient.onError = function() {
                bespokeClient.disconnect();
                server.stop(function () {
                    done();
                });
            };

            let webhookCaller = new HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });

});