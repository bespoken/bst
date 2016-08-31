/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";
import {WebhookManager} from "../../lib/server/webhook-manager";
import {WebhookRequest} from "../../lib/core/webhook-request";
import {HTTPClient} from "../../lib/core/http-client";
import {Socket} from "net";

describe("WebhookManager", function() {
    describe("Connect", function() {
        it("Should Connect and Receive Data", function(done) {
            this.timeout(5000);
            let manager = new WebhookManager(8080);
            manager.onWebhookReceived = function(request: WebhookRequest) {
                console.log("NodeID: " + request.nodeID());
                assert.equal("10", request.nodeID());
                assert.equal("Test", request.body);
                manager.stop(function () {
                    done();
                });
            };

            manager.start();

            let client = new HTTPClient();
            client.post("localhost", 8080, "/test?node-id=10", "Test");
        });
    });
});