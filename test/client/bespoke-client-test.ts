import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {Node} from "../../lib/server/node";
import {NodeManager} from "../../lib/server/node-manager";
import {Global} from "../../lib/core/global";
import {KeepAlive} from "../../lib/client/keep-alive";
import {SocketHandler} from "../../lib/core/socket-handler";
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

// Much of the testing for this class is done by NodeManager, the other side of its interface
// These tests related to the keep alive, which are tricky to write
// I believe they are worth it because this is critical functionality to our robustness
describe("BespokeClient", function() {
    const nodeMajorVersion = parseInt(process.version.substr(1, 2), 10);
    const testPort = 9000 + nodeMajorVersion;
    describe("#connect()", function() {
        it("Fails to connect", function(done) {
            const client = new BespokeClient("JPK", "localhost", 9000, "localhost", 9000 );
            client.onConnect = function (error: any) {
                assert(error);
                done();
            };
            client.connect();
        });

        it("Connects to something other than localhost", function(done) {
            this.timeout(5000);
            const client = new BespokeClient("JPK" + nodeMajorVersion,
                "proxy.bespoken.tools",
                5000,
                "127.0.0.1",
                testPort);

            client.onConnect = function (error: any) {
                const webhookCaller = new HTTPClient();
                webhookCaller.post("proxy.bespoken.tools",
                    443,
                    "/test?node-id=JPK" + nodeMajorVersion,
                    "Test",
                    function (data: Buffer, statusCode: number, success: boolean) {
                    assert.equal(data.toString(),
                        "BST Proxy - Local Forwarding Error\nconnect ECONNREFUSED 127.0.0.1:" + testPort);
                    assert.equal(statusCode, 500);

                    client.shutdown(function () {
                        done();
                    });
                });
            };

            client.onError = function (errorType, message) {
                // We expect an error - make sure it contains the correct domain name
                assert(message.indexOf("127.0.0.1") !== -1);
            };

            client.connect();
        });

        it("Rejects messages on a secure server", function(done) {
            this.timeout(5000);
            const client = new BespokeClient("JPK" + nodeMajorVersion, "proxy.bespoken.tools", 5000, "127.0.0.1", 443, "JPK");
            client.onConnect = function (error: any) {
                const webhookCaller = new HTTPClient();
                webhookCaller.post("proxy.bespoken.tools", 443, "/test?node-id=JPK" + nodeMajorVersion, "Test", function (data: Buffer, statusCode: number, success: boolean) {
                    assert.equal(data.toString(), "Unauthorized request");
                    assert.equal(statusCode, 500);

                    client.shutdown(function () {
                        done();
                    });
                });
            };

            client.onError = function (errorType, message) {
                // We expect an error - make sure it contains the correct domain name
                assert(message.indexOf("127.0.0.1") !== -1);
            };

            client.connect();
        });

        it("Accepts messages on a secure server when secret on query string", function(done) {
            this.timeout(5000);
            const client = new BespokeClient("JPK" + nodeMajorVersion, "proxy.bespoken.tools", 5000, "127.0.0.1", testPort, "JPK");
            client.onConnect = function (error: any) {
                const webhookCaller = new HTTPClient();
                const path = "/test?node-id=JPK" + nodeMajorVersion + "&bespoken-key=JPK";
                webhookCaller.post("proxy.bespoken.tools", 443, path, "Test", function (data: Buffer, statusCode: number, success: boolean) {
                    // This error comes from the webhook client instead of rejecting
                    assert.equal(data.toString(), "BST Proxy - Local Forwarding Error\nconnect ECONNREFUSED 127.0.0.1:" + testPort);
                    assert.equal(statusCode, 500);

                    client.shutdown(function () {
                        done();
                    });
                });
            };

            client.onError = function (errorType, message) {
                // We expect an error - make sure it contains the correct domain name
                assert(message.indexOf("127.0.0.1") !== -1);
            };

            client.connect();
        });

        it("Accepts messages on a secure server when secret on header", function(done) {
            this.timeout(5000);
            const client = new BespokeClient("JPK" + nodeMajorVersion, "proxy.bespoken.tools", 5000, "127.0.0.1", testPort, "JPK");
            client.onConnect = function (error: any) {
                const webhookCaller = new HTTPClient();
                const path = "/test?node-id=JPK" + nodeMajorVersion;
                const extraHeader = {
                    "bespoken-key": "JPK",
                };

                webhookCaller.postWithExtraHeaders("proxy.bespoken.tools", 443, path, "Test", extraHeader, function (data: Buffer, statusCode: number, success: boolean) {
                    // This error comes from the webhook client instead of rejecting
                    assert.equal(data.toString(), "BST Proxy - Local Forwarding Error\nconnect ECONNREFUSED 127.0.0.1:" + testPort);
                    assert.equal(statusCode, 500);

                    client.shutdown(function () {
                        done();
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

    describe("KeepAlive worked", function() {
        it("Gets lots of keep alives", function(done) {
            const nodeManager = new NodeManager(testPort);
            let count = 0;
            (<any> NodeManager).onKeepAliveReceived = function (node: Node) {
                count++;
                node.socketHandler.send(Global.KeepAliveMessage);
            };

            const client = new MockBespokeClient("JPK", "127.0.0.1", testPort, "127.0.0.1", testPort + 1);
            nodeManager.start();
            client.connect();

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
                        done(error);
                        return;
                    }
                }

                client.shutdown(function () {
                    nodeManager.stop(function () {
                        done();
                    });
                });
            }, 1000);
        });
    });

    describe("KeepAlive failed", function() {
        it("Fails", function(done) {
            const nodeManager = new NodeManager(testPort);
            let count = 0;
            (<any> NodeManager).onKeepAliveReceived = function (node: Node) {
                count++;
                if (count < 10) {
                    node.socketHandler.send(Global.KeepAliveMessage);
                }
            };

            const client = new MockBespokeClient("JPK", "127.0.0.1", testPort, "127.0.0.1", testPort + 1);
            nodeManager.start();
            client.connect();

            const originalCallback = (<any> keepAlive).onFailureCallback;
            let failureCount = 0;
            (<any> keepAlive).onFailureCallback = function () {
                originalCallback();
                failureCount++;
            };

            setTimeout(function () {
                if (failureCount > 2) {
                    try {
                        assert(false, "Too many failures received");
                    } catch (error) {
                        done(error);
                        return;
                    }
                }

                client.shutdown(function () {
                    nodeManager.stop(function () {
                        done();
                    });
                });

            }, 1000);
        });
    });

});
