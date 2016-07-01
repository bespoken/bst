/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {NodeConnection} from "../../service/node-connection";
import {NodeManager} from '../../service/node-manager';
import {WebhookManager} from "../../service/webhook-manager";
import {WebhookRequest} from "../../service/webhook-request";
import {HTTPClient} from "../../client/http-client";

describe('WebhookManager', function() {
    describe('Connect', function() {
        it('Should Connect and Receive Data', function(done) {
            let manager = new WebhookManager();
            manager.onWebhookReceived = function(request: WebhookRequest) {
                console.log("NodeID: " + request.nodeID());
                done();
            };

            manager.start();

            let client = new HTTPClient();
            client.post("Test");
        });
    });
});