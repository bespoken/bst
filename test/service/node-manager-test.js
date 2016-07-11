/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
"use strict";
var assert = require("assert");
var bespoke_client_1 = require("../../client/bespoke-client");
var node_manager_1 = require("../../service/node-manager");
describe("NodeManager", function () {
    describe("Connect", function () {
        it("Connected And Received Data", function (done) {
            var nodeManager = new node_manager_1.NodeManager(9000);
            var client = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            nodeManager.onConnect = function (node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                nodeManager.stop(function () {
                    done();
                });
            };
            nodeManager.start();
            client.connect();
            setTimeout(function () { console.log("Time UP"); }, 2000);
        });
    });
    describe("Close", function () {
        it("Worked", function (done) {
            var nodeManager = new node_manager_1.NodeManager(9000);
            nodeManager.start();
            setTimeout(function () {
                nodeManager.stop(function () {
                    done();
                });
            }, 100);
        });
    });
});
