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
            setTimeout(function () { console.log("Time UP"); }, 2000);
        });
    });

    describe("Close", function() {
        it("Worked", function (done) {
            let nodeManager = new NodeManager(9000);

            nodeManager.start();

            setTimeout(function() {
                nodeManager.stop(function () {
                    done();
                });
            }, 100);
        });
    });

    describe("KeepAlive", function() {
        it("Received", function (done) {
            let nodeManager = new NodeManager(9000);
            nodeManager.start();
            let keepAlives = 0;
            nodeManager.onKeepAliveCallback = function(node: Node) {
                keepAlives++;
            };

            let bespokeClient = new BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.onConnect = function () {
                bespokeClient.keepAlive();
            };
            bespokeClient.connect();

            setTimeout(function() {
                assert.equal(1, keepAlives);
                nodeManager.stop(function () {
                    done();
                });
            }, 100);
        });
    });
});