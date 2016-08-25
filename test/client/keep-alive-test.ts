/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";
import {Global} from "../../lib/core/global";
import {SocketHandler} from "../../lib/core/socket-handler";
import * as net from "net";
import {Socket} from "net";
import {KeepAlive} from "../../lib/client/keep-alive";
import {Server} from "net";

describe("KeepAlive", function() {

    describe("runs", function() {
        it("Sends and receives keep alive", function(done) {
            let server: Server = net.createServer(function(socket: Socket) {
                let socketHandler = new SocketHandler(socket, function (message: string) {

                    assert.equal(message, Global.KeepAliveMessage);
                    socketHandler.send(Global.KeepAliveMessage);
                });
            }).listen(9000);

            let socket = net.connect(9000, "localhost", function () {
                let handler = new SocketHandler(socket, function () {
                    keepAlive.received();

                    if ((<any> keepAlive).keepAlivesInPeriod(500).length >= 20) {
                        socket.end();
                        keepAlive.stop();
                        server.close(function () {
                            done();
                        });
                    }
                });

                let keepAlive = new KeepAlive(handler);
                keepAlive.pingPeriod = 20;
                keepAlive.warningThreshold = 12;
                keepAlive.windowPeriod = 500;
                keepAlive.start(function () {
                    assert(false, "This should not be hit");
                });
            });
        });

        it("Does not get enough keep alive", function(done) {
            let serverSocket: SocketHandler = null;
            let count = 0;

            let server: Server = net.createServer(function(socket: Socket) {
                serverSocket = new SocketHandler(socket, function () {
                    count++;
                    console.log("Count: " + count);

                    if (count < 10) {
                        serverSocket.send(Global.KeepAliveMessage);
                    } else {
                        serverSocket.disconnect();
                        server.close();
                    }
                });
            }).listen(9000);

            let socket = net.connect(9000, "localhost", function () {
                let handler = new SocketHandler(socket, function () {
                    keepAlive.received();
                });

                let keepAlive = new KeepAlive(handler);
                keepAlive.pingPeriod = 50;
                keepAlive.warningThreshold = 10;
                keepAlive.windowPeriod = 1000;
                keepAlive.start(function () {
                    // This should get hit
                    keepAlive.stop();
                    socket.end();
                    done();
                });
            });
        });
    });

    describe("#stop()", function() {
        it("Stops and sends callback", function (done) {
            let server: Server = net.createServer(function(socket: Socket) {
                let socketHandler = new SocketHandler(socket, function () {
                    socketHandler.send(Global.KeepAliveMessage);
                });
            }).listen(9000);

            let socket = net.connect(9000, "localhost", function () {
                let handler = new SocketHandler(socket, function () {
                    keepAlive.received();
                });

                let keepAlive = new KeepAlive(handler);
                keepAlive.pingPeriod = 20;
                keepAlive.warningThreshold = 12;
                keepAlive.windowPeriod = 500;
                keepAlive.start(function () {

                });

                setTimeout(function () {
                    keepAlive.stop(function () {
                        server.close();
                        done();
                    });
                }, 100);
            });
        });
    });
});
