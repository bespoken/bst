/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {Node} from "../../service/node";
import {NodeManager} from '../../service/node-manager';
import {WebhookManager} from "../../service/webhook-manager";
import {WebhookRequest} from "../../service/webhook-request";
import {HTTPClient} from "../../client/http-client";
import {Socket} from "net";

describe('WebhookManager', function() {
    describe('Connect', function() {
        it('Should Connect and Receive Data', function(done) {
            let manager = new WebhookManager(8080);
            manager.onWebhookReceived = function(socket: Socket, request: WebhookRequest) {
                console.log("NodeID: " + request.nodeID());
                assert.equal("10", request.nodeID());
                assert.equal("Test", request.body);
                done();
            };

            manager.start();

            let client = new HTTPClient();
            client.post("localhost", 8080, "/test?node-id=10", "Test");
        });
    });
});