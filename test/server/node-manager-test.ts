import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";
import {TCPClient} from "../../lib/client/tcp-client";
import {Global} from "../../lib/core/global";

describe("NodeManager", function() {
    describe("Connect", function() {
        it("Connected And Received Data", function(done) {
            let nodeManager = new NodeManager(9000);
            let client = new BespokeClient("JPK", "localhost", 9000, "localhost", 9001);

            nodeManager.onConnect = function (node: Node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                nodeManager.stop(function() {
                    done();
                });
            };

            nodeManager.start();
            client.connect();
        });

        it("Connected And Sends Bad Data", function(done) {
            let nodeManager = new NodeManager(9000);
            nodeManager.start(function () {
                let client = new TCPClient("MYID");
                client.onCloseCallback = function () {
                    // This should get called
                    nodeManager.stop(function() {
                        done();
                    });
                };
                client.transmit("localhost", 9000, Buffer.from("{1234567890123" + Global.MessageDelimiter), function () {
                    assert(false, "This should not be reached - no data should be sent back.");
                });
            });
        });

        it("Removes Node From Node Hash On Client Close", function(done) {
            let nodeManager = new NodeManager(9000);
            let client = new BespokeClient("JPK", "localhost", 9000, "localhost", 9001);

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