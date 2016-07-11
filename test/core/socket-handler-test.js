/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../node_modules/typemoq/typemoq.d.ts" />
"use strict";
var TypeMoq = require("typemoq");
var assert = require("assert");
var socket_handler_1 = require("../../core/socket-handler");
var net_1 = require("net");
var global_1 = require("../../service/global");
describe('SocketHandlerTest', function () {
    describe('Send', function () {
        it("Sends Simple Payload", function (done) {
            var mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            mockSocket.setup(function (s) { return s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()); });
            var socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                assert.equal("TEST", message);
                done();
            });
            socketHandler.onDataCallback(Buffer.from("TEST" + global_1.Global.MessageDelimiter));
        });
        it("Sends Multiple Payloads At Once", function (done) {
            var mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            mockSocket.setup(function (s) { return s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()); });
            var count = 0;
            var socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
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
            var mockSocket = TypeMoq.Mock.ofType(net_1.Socket);
            mockSocket.setup(function (s) { return s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()); });
            var socketHandler = new socket_handler_1.SocketHandler(mockSocket.object, function (message) {
                assert.equal("TEST", message);
                done();
            });
            socketHandler.onDataCallback(Buffer.from("TEST"));
            socketHandler.onDataCallback(Buffer.from(global_1.Global.MessageDelimiter));
        });
    });
});
