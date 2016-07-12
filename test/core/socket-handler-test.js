"use strict";
const TypeMoq = require("typemoq");
const assert = require("assert");
const socket_handler_1 = require("../../core/socket-handler");
const net_1 = require("net");
const global_1 = require("../../core/global");
describe('SocketHandlerTest', function () {
    describe('Send', function () {
        it("Sends Simple Payload", function (done) {
            let mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            mockSocket.setup(s => s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()));
            let socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                assert.equal("TEST", message);
                done();
            });
            socketHandler.onDataCallback(Buffer.from("TEST" + global_1.Global.MessageDelimiter));
        });
        it("Sends Multiple Payloads At Once", function (done) {
            let mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            mockSocket.setup(s => s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()));
            let count = 0;
            let socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                count++;
                if (count == 1) {
                    assert.equal("TEST", message);
                }
                else {
                    assert.equal("TEST2", message);
                    done();
                }
            });
            socketHandler.onDataCallback(Buffer.from("TEST" + global_1.Global.MessageDelimiter + "TEST2" + global_1.Global.MessageDelimiter));
        });
        it("Sends Incomplete Payload", function (done) {
            let mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            mockSocket.setup(s => s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()));
            let socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                assert.equal("TEST", message);
                done();
            });
            socketHandler.onDataCallback(Buffer.from("TEST"));
            socketHandler.onDataCallback(Buffer.from(global_1.Global.MessageDelimiter));
        });
    });
});
//# sourceMappingURL=socket-handler-test.js.map