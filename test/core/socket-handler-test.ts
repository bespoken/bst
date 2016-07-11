/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../node_modules/typemoq/typemoq.d.ts" />

import * as TypeMoq from "typemoq";
import * as assert from "assert";

import {SocketHandler} from "../../core/socket-handler";
import {Socket} from "net";
import {Global} from "../../service/global";

describe('SocketHandlerTest', function() {
    describe('Send', function() {
        it("Sends Simple Payload", function(done) {
            let mockSocket:TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);
            mockSocket.setup(s => s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()));

            let socketHandler = new SocketHandler(mockSocket.object, function(message: string) {
                assert.equal("TEST", message);
                done();
            });

            socketHandler.onDataCallback(Buffer.from("TEST" + Global.MessageDelimiter));
        });

        it("Sends Multiple Payloads At Once", function(done) {
            let mockSocket:TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);
            mockSocket.setup(s => s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()));

            let count = 0;
            let socketHandler = new SocketHandler(mockSocket.object, function(message: string) {
                count++;
                if (count == 1) {
                    assert.equal("TEST", message);
                } else {
                    assert.equal("TEST2", message);
                    done();
                }
            });

            socketHandler.onDataCallback(Buffer.from("TEST" + Global.MessageDelimiter + "TEST2" + Global.MessageDelimiter));
        });

        it("Sends Incomplete Payload", function(done) {
            let mockSocket:TypeMoq.Mock<Socket> = TypeMoq.Mock.ofType(Socket);
            mockSocket.setup(s => s.on(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()));

            let socketHandler = new SocketHandler(mockSocket.object, function(message: string) {
                assert.equal("TEST", message);
                done();
            });

            socketHandler.onDataCallback(Buffer.from("TEST"));
            socketHandler.onDataCallback(Buffer.from(Global.MessageDelimiter));

        });
    });
});