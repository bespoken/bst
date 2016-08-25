/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";

describe("NodeManager", function() {
    describe("Connect", function() {
        it("Connected And Received Data", function(done) {
            let nodeManager = new NodeManager(9000);
            let client = new BespokeClient("JPK", "localhost", 9000, 9001);

            nodeManager.onConnect = function (node: Node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                nodeManager.stop(function() {
                    done();
                });
            };

            nodeManager.start();
            client.connect();
        });

        it("Removes Node From Node Hash On Client Close", function(done) {
            let nodeManager = new NodeManager(9000);
            let client = new BespokeClient("JPK", "localhost", 9000, 9001);

            nodeManager.onConnect = function (node: Node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());

                client.shutdown(function () {

                });
            };

            nodeManager.onNodeRemoved = function () {
                assert.equal(Object.keys((<any> nodeManager).nodes).length, 0);
                nodeManager.stop(function() {
                    done();
                });
            };

            nodeManager.start();
            client.connect();
        });
    });

    describe("Close", function() {
        it("Closed Successfully", function (done) {
            let nodeManager = new NodeManager(9000);

            nodeManager.start(function() {
                nodeManager.stop(function () {
                    done();
                });
            });
        });
    });
});