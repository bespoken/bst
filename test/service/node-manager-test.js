"use strict";
const assert = require("assert");
const bespoke_client_1 = require('../../client/bespoke-client');
const node_manager_1 = require('../../service/node-manager');
describe('NodeManager', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            let nodeManager = new node_manager_1.NodeManager(9999);
            let client = new bespoke_client_1.BespokeClient("JPK", "localhost", 9999, 9998);
            nodeManager.onConnect = function (node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                done();
            };
            let count = 0;
            nodeManager.onReceive = function (node, data) {
                console.log("OnReceive: " + data);
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                count++;
                if (count == 1) {
                    assert.equal("{\"id\":\"JPK\"}", data);
                    client.disconnect();
                }
                else {
                    assert.equal("I am Chuck Norris!", data);
                }
            };
            nodeManager.onClose = function () {
            };
            nodeManager.start();
            client.connect();
            setTimeout(function () { console.log("Time UP"); }, 2000);
        });
    });
});
//# sourceMappingURL=node-manager-test.js.map