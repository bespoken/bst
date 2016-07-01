var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var connection_handler_1 = require('../../service/connection-handler');
describe('ConnectionHandler', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var handler = new connection_handler_1.ConnectionHandler(9999);
            var client = new bespoke_client_1.BespokeClient("localhost", 9999);
            handler.onConnect = function (connection) {
                assert.equal("127.0.0.1", connection.remoteAddress());
            };
            handler.onReceive = function (connection, data) {
                console.log("OnReceive: " + data);
                assert.equal("127.0.0.1", connection.remoteAddress());
                assert.equal("I am Chuck Norris!", data);
                client.disconnect();
            };
            handler.onClose = function () {
                done();
            };
            handler.start();
            client.connect();
            client.write("I am Chuck Norris!", null);
        });
    });
});
//# sourceMappingURL=connection-handler-test.js.map