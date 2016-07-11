/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {Node} from "../../service/node";
import {NodeManager} from '../../service/node-manager';
import {WebhookManager} from "../../service/webhook-manager";
import {WebhookRequest} from "../../service/webhook-request";
import {HTTPClient} from "../../client/http-client";
import {BespokeServer} from "../../service/bespoke-server";
import {Socket} from "net";
import {NetworkErrorType} from "../../service/global";

describe('BespokeServerTest', function() {
    describe('ReceiveWebhook', function() {
        it('Connects and Receives Callback', function(done) {
            //Start the server
            let server = new BespokeServer(8000, 9000);
            server.start();

            //Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();

            bespokeClient.onWebhookReceived = function(socket: Socket, webhookRequest: WebhookRequest) {
                console.log("Client ReceivedData: " + webhookRequest.body);
                assert.equal("Test", webhookRequest.body);
                server.stop();
                bespokeClient.disconnect();
                done();
            };

            let webhookCaller = new HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });

        it('Handles Connection Failure', function(done) {
            this.timeout(1000);
            //Start the server
            let server = new BespokeServer(8000, 9000);
            server.start();

            //Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
            console.log("Test2");
            bespokeClient.connect();
            bespokeClient.onError = function(errorType: NetworkErrorType, message: string) {
                done();
            };

            let webhookCaller = new HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
        });
    });

});