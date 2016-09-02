/// <reference path="../../typings/index.d.ts" />

import * as TypeMoq from "typemoq";
import * as assert from "assert";
import * as net from "net";

import {SocketHandler} from "../../lib/core/socket-handler";
import {Socket} from "net";
import {Global} from "../../lib/core/global";
import {BufferUtil} from "../../lib/core/buffer-util";

describe("SocketHandlerTest", function() {
    beforeEach(function () {
        this.server = net.createServer(function() {

        }).listen(10000);
    });

    afterEach(function () {
        this.server.close(function () {

        });
    });

    describe("Send", function() {
        it("Sends Simple Payload", function(done) {
            let mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let socketHandler = new SocketHandler(mockSocket.object, function(message: string) {
                assert.equal("TEST", message);
                done();
            });

            socketHandler.onDataCallback(BufferUtil.fromString("TEST" + new Date().getTime() + Global.MessageDelimiter));
        });

        it("Sends Multiple Payloads At Once", function(done) {
            let mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            let socketHandler = new SocketHandler(mockSocket.object, function(message: string, messageID: number) {
                count++;
                if (count === 1) {
                    assert.equal((messageID + "").length, 13);
                    assert.equal("TEST", message);
                } else {
                    assert.equal("TEST2", message);
                    done();
                }
            });
            let data = "TEST" + new Date().getTime() + Global.MessageDelimiter + "TEST2" + new Date().getTime() + Global.MessageDelimiter;
            socketHandler.onDataCallback(BufferUtil.fromString(data));
        });

        it("Sends Broken Up Payloads", function(done) {
            let mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            let socketHandler = new SocketHandler(mockSocket.object, function(message: string, messageID: number) {
                count++;
                if (count === 1) {
                    assert.equal(message, "Test]}}");
                    assert.equal(messageID, 1234567890124);
                } else {
                    assert.equal(message, "BlobBlob2");
                    assert.equal(messageID, 1234567890123);
                    done();
                }
            });

            let payload1 = "Test]}}123456789012447726";
            let payload2 = "16365";
            let payload3 = "Blob";
            let payload4 = "Blob212345678901234772616365";

            socketHandler.onDataCallback(BufferUtil.fromString(payload1));
            socketHandler.onDataCallback(BufferUtil.fromString(payload2));
            socketHandler.onDataCallback(BufferUtil.fromString(payload3));
            socketHandler.onDataCallback(BufferUtil.fromString(payload4));
        });

        it("Sends More Broken Up Payloads", function(done) {
            let mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            let socketHandler = new SocketHandler(mockSocket.object, function(message: string, messageID: number) {
                count++;
                if (count === 1) {
                    assert.equal(message, "Test");
                    assert.equal(messageID, 1234567890123);
                } else {
                    assert.equal(message, "BlobBlob2");
                    assert.equal(messageID, 1234567890124);
                    done();
                }
            });

            let payload1 = "Test1234567890123";
            let payload2 = "4772616365";
            let payload3 = "Blob";
            let payload4 = "Blob2123456";
            let payload5 = "78901244772";
            let payload6 = "616365";

            socketHandler.onDataCallback(BufferUtil.fromString(payload1));
            socketHandler.onDataCallback(BufferUtil.fromString(payload2));
            socketHandler.onDataCallback(BufferUtil.fromString(payload3));
            socketHandler.onDataCallback(BufferUtil.fromString(payload4));
            socketHandler.onDataCallback(BufferUtil.fromString(payload5));
            socketHandler.onDataCallback(BufferUtil.fromString(payload6));
        });
    });

    describe("#newSocket", function () {
        it("Sends callback on failure to connect", function (done) {
            let client = new net.Socket();

            SocketHandler.connect("localhost", 10001,
                function (error: any) {
                    assert(error);
                    done();
                },
                function () {

                }
            );

            client.end();
        });
    });

    describe("#close", function() {
        it("Sends callback on close", function (done) {
            let client = new net.Socket();
            let socketHandler = SocketHandler.connect("localhost", 10001,
                function (error: any) {
                    assert(error);
                    done();
                },
                function () {}
            );

            socketHandler.onCloseCallback = function() {
                console.log("Closed!");
                done();
            };

            client.end();
        });

        it("No error when no callback registered on close", function (done) {
            let client = new net.Socket();
            client.connect(10000, "localhost", function () {
                new SocketHandler(client, function (message: string) {

                });

                client.end();

                setTimeout(function () {
                    done();
                }, 200);
            });
        });
        it("No error on send after disconnect", function (done) {
            let client = new net.Socket();
            client.connect(10000, "localhost", function () {
                let handler = new SocketHandler(client, function (message: string) {

                });

                handler.disconnect();
                handler.send("No error on this");

                setTimeout(function () {
                    done();
                }, 200);
            });
        });
    });
});