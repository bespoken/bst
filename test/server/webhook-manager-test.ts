/**
 * Created by jpk on 7/1/16.
 */

import * as assert from "assert";

import {WebhookManager} from "../../lib/server/webhook-manager";
import {WebhookRequest} from "../../lib/core/webhook-request";
import {HTTPClient} from "../../lib/core/http-client";

describe("WebhookManager", function() {
    before(() => {
        // Do not use SSL for unit tests
        delete process.env.SSL_CERT;
    });

    describe("Connect", function() {
        it("Should Connect and Receive Data", function(done) {
            this.timeout(5000);
            let manager = new WebhookManager(8080);
            manager.onWebhookReceived = function(request: WebhookRequest) {
                console.log("NodeID: " + request.nodeID());
                assert.equal(request.nodeID(), 10);
                assert.equal((request.id() + "").length, 13);
                assert.equal(request.body, "Test");
                manager.stop(function () {
                    done();
                });
            };

            manager.start();

            let client = new HTTPClient();
            client.post("localhost", 8080, "/test?node-id=10", "Test");
        });

        it("Should Send Two in a row", function(done) {
            this.timeout(5000);
            let manager = new WebhookManager(8080);

            let count = 0;
            manager.onWebhookReceived = function(request: WebhookRequest) {
                count++;
                console.log("NodeID: " + request.nodeID());
                assert.equal(request.nodeID(), 10);
                assert.equal((request.id() + "").length, 13);
                assert.equal(request.body, "Test");
                if (count === 2) {
                    manager.stop(function () {
                        done();
                    });
                }
            };

            manager.start();

            let client = new HTTPClient();
            client.post("localhost", 8080, "/test?node-id=10", "Test");
            client.post("localhost", 8080, "/test?node-id=10", "Test");
        });
    });
});