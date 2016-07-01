var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var connection_handler_1 = require('../../service/connection-handler');
describe('ConnectionHandler', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var handler = new connection_handler_1.ConnectionHandler(9999, function (connection) {
                assert.equal("127.0.0.1", connection.remoteAddress());
            });
            handler.onReceiveCallback = function (connection, data) {
                assert.equal("127.0.0.1", connection.remoteAddress());
                assert.equal("I am Chuck Norris!", data);
                done();
            };
            handler.onCloseCallback = function () {
                done();
            };
            handler.start();
            var client = new bespoke_client_1.BespokeClient("localhost", 9999);
            client.connect();
            client.write("I am Chuck Norris!");
            client.disconnect();
        });
    });
});
//# sourceMappingURL=connection-handler-test.js.map