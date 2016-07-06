var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var node_manager_1 = require('../../service/node-manager');
describe('NodeManager', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var nodeManager = new node_manager_1.NodeManager(9999);
            var client = new bespoke_client_1.BespokeClient("JPK", "localhost", 9999);
            nodeManager.onConnect = function (node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                done();
            };
            var count = 0;
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