"use strict";
const assert = require("assert");
const bespoke_client_1 = require('../../client/bespoke-client');
const node_manager_1 = require('../../service/node-manager');
describe('NodeManager', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            let nodeManager = new node_manager_1.NodeManager(9000);
            let client = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            nodeManager.onConnect = function (node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                nodeManager.stop();
                done();
            };
            nodeManager.start();
            client.connect();
            setTimeout(function () { console.log("Time UP"); }, 2000);
        });
    });
    describe('Close Worked', function () {
        it('Close Worked', function (done) {
            let nodeManager = new node_manager_1.NodeManager(9000);
            nodeManager.start();
            setTimeout(function () {
                nodeManager.stop();
                done();
            }, 100);
        });
    });
});
//# sourceMappingURL=node-manager-test.js.map