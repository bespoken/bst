"use strict";
const TypeMoq = require("typemoq");
const assert = require("assert");
const net = require("net");
const socket_handler_1 = require("../../lib/core/socket-handler");
const net_1 = require("net");
const global_1 = require("../../lib/core/global");
const buffer_util_1 = require("../../lib/core/buffer-util");
describe("SocketHandlerTest", function () {
    let server = null;
    beforeEach(function () {
        this.server = net.createServer(function (socket) {
        }).listen(10000);
    });
    afterEach(function () {
        this.server.close(function () {
        });
    });
    describe("Send", function () {
        it("Sends Simple Payload", function (done) {
            let mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            let socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                assert.equal("TEST", message);
                done();
            });
            socketHandler.onDataCallback(buffer_util_1.BufferUtil.fromString("TEST" + global_1.Global.MessageDelimiter));
        });
        it("Sends Multiple Payloads At Once", function (done) {
            let mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            let count = 0;
            let socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                count++;
                if (count === 1) {
                    assert.equal("TEST", message);
                }
                else {
                    assert.equal("TEST2", message);
                    done();
                }
            });
            socketHandler.onDataCallback(buffer_util_1.BufferUtil.fromString("TEST" + global_1.Global.MessageDelimiter + "TEST2" + global_1.Global.MessageDelimiter));
        });
        it("Sends Incomplete Payload", function (done) {
            let mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            let socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                assert.equal("TEST", message);
                done();
            });
            socketHandler.onDataCallback(buffer_util_1.BufferUtil.fromString("TEST"));
            socketHandler.onDataCallback(buffer_util_1.BufferUtil.fromString(global_1.Global.MessageDelimiter));
        });
    });
    describe("#close", function () {
        it("Sends callback on close", function (done) {
            let client = new net.Socket();
            client.connect(10000, "localhost", function () {
                let socketHandler = new socket_handler_1.SocketHandler(client, function (message) {
                });
                socketHandler.onCloseCallback = function () {
                    console.log("Closed!");
                    done();
                };
                client.end();
            });
        });
        it("No error when no callback registered on close", function (done) {
            let client = new net.Socket();
            client.connect(10000, "localhost", function () {
                let socketHandler = new socket_handler_1.SocketHandler(client, function (message) {
                });
                client.end();
                setTimeout(function () {
                    done();
                }, 200);
            });
        });
    });
});
//# sourceMappingURL=socket-handler-test.js.map