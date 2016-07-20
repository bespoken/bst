/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../node_modules/typemoq/typemoq.d.ts" />

import * as TypeMoq from "typemoq";
import * as assert from "assert";
import * as net from "net";

import {SocketHandler} from "../../lib/core/socket-handler";
import {Socket} from "net";
import {Global} from "../../lib/core/global";
import {Server} from "net";

describe("SocketHandlerTest", function() {
    let server: Server = null;
    beforeEach(function () {
        this.server = net.createServer(function(socket: Socket) {

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

            socketHandler.onDataCallback(Buffer.from("TEST" + Global.MessageDelimiter));
        });

        it("Sends Multiple Payloads At Once", function(done) {
            let mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let count = 0;
            let socketHandler = new SocketHandler(mockSocket.object, function(message: string) {
                count++;
                if (count === 1) {
                    assert.equal("TEST", message);
                } else {
                    assert.equal("TEST2", message);
                    done();
                }
            });

            socketHandler.onDataCallback(Buffer.from("TEST" + Global.MessageDelimiter + "TEST2" + Global.MessageDelimiter));
        });

        it("Sends Incomplete Payload", function(done) {
            let mockSocket: TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);

            let socketHandler = new SocketHandler(mockSocket.object, function(message: string) {
                assert.equal("TEST", message);
                done();
            });

            socketHandler.onDataCallback(Buffer.from("TEST"));
            socketHandler.onDataCallback(Buffer.from(Global.MessageDelimiter));
        });
    });

    describe("#close", function() {
        it("Sends callback on close", function (done) {
            let client = new net.Socket();
            client.connect(10000, "localhost", function () {
                let socketHandler = new SocketHandler(client, function (message: string) {

                });

                socketHandler.onCloseCallback = function() {
                    console.log("Closed!");
                    done();
                };

                client.end();
            });
        });

        it("No error when no callback registered on close", function (done) {
            let client = new net.Socket();
            client.connect(10000, "localhost", function () {
                let socketHandler = new SocketHandler(client, function (message: string) {

                });

                client.end();

                setTimeout(function () {
                    done();
                }, 200);
            });
        });
    });
});