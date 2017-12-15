import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";
import {Global} from "../../lib/core/global";
import {KeepAlive} from "../../lib/client/keep-alive";
import {SocketHandler, SocketMessage} from "../../lib/core/socket-handler";
import {HTTPClient} from "../../lib/core/http-client";

let keepAlive: KeepAlive = null;
class MockBespokeClient extends BespokeClient {
    protected newKeepAlive(handler: SocketHandler): KeepAlive {
        keepAlive = new KeepAlive(handler);
        keepAlive.pingPeriod = 20;
        keepAlive.warningThreshold = 10;
        keepAlive.windowPeriod = 400;
        return keepAlive;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Much of the testing for this class is done by NodeManager, the other side of its interface
// These tests related to the keep alive, which are tricky to write
// I believe they are worth it because this is critical functionality to our robustness
describe("BespokeClient", function() {
    const nodeMajorVersion = parseInt(process.version.substr(1, 2), 10);
    const testPort = 9000 + nodeMajorVersion;

    describe("#connect()", function() {
        it("Fails to connect", function() {
            this.timeout(13000);

            return new Promise((resolve, reject) => {
                const client = new BespokeClient("JPKa", "localhost", 9000, "localhost", 9000 );
                let reconnectAttempts = 0;
                client.onReconnect = function (error: any) {
                    reconnectAttempts++;
                };

                client.onConnect = function (error: any) {
                    try {
                        assert.equal(reconnectAttempts, BespokeClient.RECONNECT_MAX_RETRIES, "Not enough reconnects");
                        assert(error);
                        resolve();
                    } catch (assertErr) {
                        reject(assertErr);
                    }
                };
                client.connect();
            });
        });

        it("Connects to something other than localhost", function() {

            this.timeout(5000);
            return new Promise(resolve => {

                const client = new BespokeClient("JPKb" + nodeMajorVersion,
                    "proxy.bespoken.tools",
                    5000,
                    "127.0.0.1",
                    testPort);

                client.onConnect = function (error: any) {
                    const webhookCaller = new HTTPClient();
                    webhookCaller.post("proxy.bespoken.tools",
                        443,
                        "/test?node-id=JPKb" + nodeMajorVersion,
                        "Test",
                        function (data: Buffer, statusCode: number, success: boolean) {
                            assert.equal(data.toString(),
                                "BST Proxy - Local Forwarding Error\nconnect ECONNREFUSED 127.0.0.1:" + testPort);
                            assert.equal(statusCode, 500);

                            client.shutdown(function () {
                                resolve();
                            });
                        });
                };

                client.onError = function (errorType, message) {
                    // We expect an error - make sure it contains the correct domain name
                    assert(message.indexOf("127.0.0.1") !== -1);
                };

                client.connect();
            });
        });

        it("Rejects messages on a secure server", function() {
            this.timeout(5000);
            return new Promise(resolve => {
                const client = new BespokeClient("JPKc" + nodeMajorVersion, "proxy.bespoken.tools", 5000, "127.0.0.1", 443, "JPKc");
                client.onConnect = function (error: any) {
                    const webhookCaller = new HTTPClient();
                    webhookCaller.post("proxy.bespoken.tools", 443, "/test?node-id=JPKc" + nodeMajorVersion, "Test", function (data: Buffer, statusCode: number, success: boolean) {

                        assert.equal(data.toString(), "Unauthorized request");
                        assert.equal(statusCode, 500);

                        client.shutdown(function () {
                            resolve();
                        });
                    });
                };

                client.onError = function (errorType, message) {
                    // We expect an error - make sure it contains the correct domain name
                    assert(message.indexOf("127.0.0.1") !== -1);
                };

                client.connect();
            });
        });

        it("Accepts messages on a secure server when secret on query string", function() {
            this.timeout(8000);
            return new Promise(resolve => {

                const client = new BespokeClient("JPKd" + nodeMajorVersion, "proxy.bespoken.tools", 5000, "127.0.0.1", testPort, "JPKd");
                client.onConnect = function (error: any) {
                    const webhookCaller = new HTTPClient();
                    const path = "/test?node-id=JPKd" + nodeMajorVersion + "&bespoken-key=JPKd";
                    webhookCaller.post("proxy.bespoken.tools", 443, path, "Test", function (data: Buffer, statusCode: number, success: boolean) {
                        // This error comes from the webhook client instead of rejecting
                        assert.equal(data.toString(), "BST Proxy - Local Forwarding Error\nconnect ECONNREFUSED 127.0.0.1:" + testPort);
                        assert.equal(statusCode, 500);

                        client.shutdown(function () {
                            resolve();
                        });
                    });
                };

                client.onError = function (errorType, message) {
                    // We expect an error - make sure it contains the correct domain name
                    assert(message.indexOf("127.0.0.1") !== -1);
                };

                client.connect();
            });

        });

        it("Accepts messages on a secure server when secret on header", function() {
            this.timeout(5000);
            return new Promise(resolve => {

                const client = new BespokeClient("JPKe" + nodeMajorVersion, "proxy.bespoken.tools", 5000, "127.0.0.1", testPort, "JPKe");
                client.onConnect = function (error: any) {
                    const webhookCaller = new HTTPClient();
                    const path = "/test?node-id=JPKe" + nodeMajorVersion;
                    const extraHeader = {
                        "bespoken-key": "JPKe",
                    };

                    webhookCaller.postWithExtraHeaders("proxy.bespoken.tools", 443, path, "Test", extraHeader, function (data: Buffer, statusCode: number, success: boolean) {
                        // This error comes from the webhook client instead of rejecting
                        assert.equal(data.toString(), "BST Proxy - Local Forwarding Error\nconnect ECONNREFUSED 127.0.0.1:" + testPort);
                        assert.equal(statusCode, 500);

                        client.shutdown(function () {
                            resolve();
                        });
                    });
                };

                client.onError = function (errorType, message) {
                    // We expect an error - make sure it contains the correct domain name
                    assert(message.indexOf("127.0.0.1") !== -1);
                };

                client.connect();
            });
        });
    });

    describe("KeepAlive failed", function() {
        it("Fails", function() {
            this.timeout(8000);
            return new Promise(async (resolve, reject) => {
                const nodeManager = new NodeManager(testPort);
                let wasFailureFunctionOverwritten = false;
                let failureCount = 0;

                let count = 0;
                (<any> NodeManager).onKeepAliveReceived = function (node: Node) {

                    // We overwrite the failure callback on first keepAlive to ensure keepAlive is already populated                                                                                                                                                                                                                                                                                                                                                                                                                      
                    if (!wasFailureFunctionOverwritten) {
                        const originalCallback = (<any> keepAlive).onFailureCallback;
                        (<any> keepAlive).onFailureCallback = function () {
                            originalCallback();
                            console.log("Adding a failure :(");
                            failureCount++;

                        };
                        wasFailureFunctionOverwritten = true;
                    }


                    count++;
                    if (count < 10) {
                        node.socketHandler.send(new SocketMessage(Global.KeepAliveMessage));
                    }
                };

                BespokeClient.RECONNECT_MAX_RETRIES = 0;
                const client = new MockBespokeClient("JPKg", "127.0.0.1", testPort, "127.0.0.1", testPort + 1);
                nodeManager.start();
                client.connect();

                setTimeout(function () {
                    if (failureCount > 2) {
                        try {
                            assert(false, "Too many failures received");
                        } catch (error) {
                            reject(error);
                            return;
                        }
                    }

                    client.shutdown(function () {
                        nodeManager.stop(function () {
                            BespokeClient.RECONNECT_MAX_RETRIES = 3;

                            resolve();
                        });
                    });

                }, 1000);
            });

        });

    });

    describe("KeepAlive worked", function() {
        // we need to give this time to retry shutdown then close
        this.timeout(8000);
        it("Gets lots of keep alives", async function() {
            return new Promise(async (resolve, reject) => {
                const nodeManager = new NodeManager(testPort);
                let count = 0;
                (<any> NodeManager).onKeepAliveReceived = function (node: Node) {
                    count++;
                    node.socketHandler.send(new SocketMessage(Global.KeepAliveMessage));
                };

                const client = new MockBespokeClient("JPKf", "localhost", testPort, "localhost", testPort + 1);
                nodeManager.start();
                client.connect();

                // We give time to stablish connection and set keepAlive
                await sleep(100);
                let originalCallback = (<any> keepAlive).onFailureCallback;
                (<any> keepAlive).onFailureCallback = function () {
                    originalCallback();
                    assert(false, "This callback should not be hit");
                };

                // Let everything run for one second and ensure no errors are received
                setTimeout(function () {
                    // Mac and Linux generate more events than windows due threading in windows

                    if ((process.platform.includes("win") &&  count < 8) ||
                        (!process.platform.includes("win") && count < 40)) {
                        try {
                            assert(false, "Not enough keep alives received");
                        } catch (error) {
                            reject(error);
                            return;
                        }
                    }

                    client.shutdown(function () {
                        nodeManager.stop(function () {
                            resolve();
                        });
                    });
                }, 1000);
            });

        });
    });

});
