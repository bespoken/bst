import * as TypeMoq from "typemoq";
import * as assert from "assert";
import * as net from "net";

import {SocketHandler, SocketMessage} from "../../lib/core/socket-handler";
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
            const mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            const socketHandler = new SocketHandler(mockSocket.object, function(message: SocketMessage) {
                assert.equal("TEST", message.asString());
                done();
            });

            socketHandler.onDataCallback(BufferUtil.fromString("TEST" + new Date().getTime() + Global.MessageDelimiter));
        });

        it("Sends No Message ID Payload", function(done) {
            const mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            // Second message is received buy not the first
            const socketHandler = new SocketHandler(mockSocket.object, function(message: SocketMessage) {
                assert.equal(message.asString(), "TESTB");
                done();
            });

            socketHandler.onDataCallback(BufferUtil.fromString("TESTA123123" + Global.MessageDelimiter));
            socketHandler.onDataCallback(BufferUtil.fromString("TESTB1234567890123" + Global.MessageDelimiter));
        });

        it("Sends Bad Message ID Payload", function(done) {
            const mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            // Second message is received buy not the first
            const socketHandler = new SocketHandler(mockSocket.object, function(message: SocketMessage) {
                assert.equal(message.asString(), "TESTB");
                done();
            });

            socketHandler.onDataCallback(BufferUtil.fromString("TESTA123A567890123" + Global.MessageDelimiter));
            socketHandler.onDataCallback(BufferUtil.fromString("TESTAABCDEFGHIJKLM" + Global.MessageDelimiter));
            socketHandler.onDataCallback(BufferUtil.fromString("TESTB1234567890123" + Global.MessageDelimiter));
        });


        it("Sends Multiple Payloads At Once", function(done) {
            const mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            const socketHandler = new SocketHandler(mockSocket.object, function(message: SocketMessage) {
                count++;
                if (count === 1) {
                    assert.equal((message.getMessageID() + "").length, 13);
                    assert.equal("TEST", message.asString());
                } else {
                    assert.equal("TEST2", message.asString());
                    done();
                }
            });
            const data = "TEST" + new Date().getTime() + Global.MessageDelimiter + "TEST2" + new Date().getTime() + Global.MessageDelimiter;
            socketHandler.onDataCallback(BufferUtil.fromString(data));
        });

        it("Sends Broken Up Payloads", function(done) {
            const mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            const socketHandler = new SocketHandler(mockSocket.object, function(socketMessage: SocketMessage) {
                count++;
                if (count === 1) {
                    assert.equal(socketMessage.asString(), "Test]}}");
                    assert.equal(socketMessage.getMessageID(), 1234567890124);
                } else {
                    assert.equal(socketMessage.asString(), "BlobBlob2");
                    assert.equal(socketMessage.getMessageID(), 1234567890123);
                    done();
                }
            });

            const payload1 = "Test]}}123456789012447726";
            const payload2 = "16365";
            const payload3 = "Blob";
            const payload4 = "Blob212345678901234772616365";

            socketHandler.onDataCallback(BufferUtil.fromString(payload1));
            socketHandler.onDataCallback(BufferUtil.fromString(payload2));
            socketHandler.onDataCallback(BufferUtil.fromString(payload3));
            socketHandler.onDataCallback(BufferUtil.fromString(payload4));
        });

        it("Sends More Broken Up Payloads", function(done) {
            const mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            const socketHandler = new SocketHandler(mockSocket.object, function(socketMessage: SocketMessage) {
                count++;
                if (count === 1) {
                    assert.equal(socketMessage.asString(), "Test");
                    assert.equal(socketMessage.getMessageID(), 1234567890123);
                } else {
                    assert.equal(socketMessage.asString(), "BlobBlob2");
                    assert.equal(socketMessage.getMessageID(), 1234567890124);
                    done();
                }
            });

            const payload1 = "Test1234567890123";
            const payload2 = "4772616365";
            const payload3 = "Blob";
            const payload4 = "Blob2123456";
            const payload5 = "78901244772";
            const payload6 = "616365";

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
            const client = new net.Socket();

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
            const client = new net.Socket();
            const socketHandler = SocketHandler.connect("localhost", 10001,
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
            const client = new net.Socket();
            client.connect(10000, "localhost", function () {
                new SocketHandler(client, function (message: any) {

                });

                client.end();

                setTimeout(function () {
                    done();
                }, 200);
            });
        });
        it("No error on send after disconnect", function (done) {
            const client = new net.Socket();
            client.connect(10000, "localhost", function () {
                const handler = new SocketHandler(client, function (message: SocketMessage) {

                });

                handler.disconnect();
                handler.send(new SocketMessage("No error on this"));

                setTimeout(function () {
                    done();
                }, 200);
            });
        });
    });
});