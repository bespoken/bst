import * as assert from "assert";

import {BespokeClient} from "../../lib/client/bespoke-client";
import {WebhookRequest} from "../../lib/core/webhook-request";
import {HTTPClient} from "../../lib/core/http-client";
import {BespokeServer} from "../../lib/server/bespoke-server";
import {LambdaServer} from "../../lib/client/lambda-server";
import * as request from "request";
import {IncomingMessage} from "http";
import {Global} from "../../lib/core/global";
import {SocketMessage} from "../../lib/core/socket-handler";

describe("BespokeServerTest", function() {
    before(() => {
        // Do not use SSL for unit tests
        delete process.env.SSL_CERT;
    });

    describe("ReceiveWebhook", function() {
        it("Connects and Receives Callback", function(done) {
            this.timeout(2000);
            // Start the server - try this new-fangled asyncawait library as I'm tired of all the callbacks
            //  in my unit tests
            let server = new BespokeServer(8010, 9010);
            server.start();

            // Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9010, "localhost", 9011);
            (<any> bespokeClient).onWebhookReceived = function(webhookRequest: WebhookRequest) {
                assert.equal("Test", webhookRequest.body);

                // Dummy response from a non-existent HTTP service
                let response = "HTTP/1.1 200 OK\r\nContent-Length: 15\r\n\r\n";
                response += JSON.stringify({"data": "test"});
                (<any> bespokeClient).socketHandler.send(new SocketMessage(response, webhookRequest.id()));
            };

            bespokeClient.connect(function () {
                let webhookCaller = new HTTPClient();
                webhookCaller.post("localhost", 8010, "/?node-id=JPK", "Test", function (data: Buffer) {
                    console.log("data: " + data.toString());
                    let json = JSON.parse(data.toString());
                    assert.equal(json.data, "test");
                    bespokeClient.shutdown(function () {
                        server.stop(function () {
                            done();
                        });
                    });
                });
            });


        });

        it("Connects Multiple Lambdas", function(done) {
            this.timeout(10000);

            // Start all the stuff
            let server = new BespokeServer(8010, 9010);
            let lambdaServer = new LambdaServer("./test/resources/DelayedLambda.js", 10000);
            let bespokeClient = new BespokeClient("JPK", "localhost", 9010, "localhost", 10000);

            server.start(function () {
                lambdaServer.start(function () {
                    bespokeClient.connect(function () {
                        onStarted();
                    });
                });
            });

            // The meat of the test - after everything has started
            let onStarted = function () {
                let webhookCaller = new HTTPClient();
                webhookCaller.post("localhost", 8010, "/?node-id=JPK", "{\"test\": true}", function (data: Buffer) {
                    let json = JSON.parse(data.toString());
                    assert(json.success);
                    onCompleted();
                });

                // Stagger the requests slightly
                setTimeout(function () {
                    webhookCaller.post("localhost", 8010, "/?node-id=JPK", "{\"test\": true}", function (data: Buffer) {
                        let json = JSON.parse(data.toString());
                        assert(json.success);
                        onCompleted();
                    });
                }, 50);
            };

            let count = 0;
            let onCompleted = function () {
                count++;
                if (count === 2) {
                    lambdaServer.stop(function () {
                        bespokeClient.shutdown(function () {
                            server.stop(function () {
                                done();
                            });
                        });
                    });
                }
            };
        });

        it("Connects NoOp Lambda", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8010, 9010);
            server.start();

            let badLambda = new LambdaServer("./test/resources/NoOpLambda.js", 10000, true);
            badLambda.start();

            let count = 0;
            setTimeout(function () {
                assert.equal(count, 1);
                badLambda.stop(function () {
                    bespokeClient.shutdown(function () {
                        server.stop(function () {
                            done();
                        });
                    });
                });
            }, 100);

            // Connect a client
            let bespokeClient = new BespokeClient("JPK", "localhost", 9010, "localhost", 10000);
            bespokeClient.connect(function () {
                let webhookCaller = new HTTPClient();
                webhookCaller.post("localhost", 8010, "/?node-id=JPK", "{\"noop\": true}", function (data: Buffer, status: number, success: boolean) {
                    count++;
                    console.log("data: " + data.toString());
                    assert.equal(success, false);
                });

                setTimeout(function () {
                    webhookCaller.post("localhost", 8010, "/?node-id=JPK", "{\"noop\": false}", function () {
                        count++;
                    });
                }, 10);
            });

        });

        it("Handles Error Connecting To Target Server", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);
            server.start(function () {
                // Connect a client
                let bespokeClient = new BespokeClient("JPK", "localhost", 9000, "localhost", 9001);
                bespokeClient.onConnect = function () {
                    let webhookCaller = new HTTPClient();
                    webhookCaller.post("localhost", 8000, "/?node-id=JPK", "Test");
                };

                bespokeClient.connect();
                bespokeClient.onError = function() {
                    bespokeClient.shutdown();
                    server.stop(function () {
                        done();
                    });
                };
            });
        });

        it("Handles Bad Node", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);

            server.start(function () {
                let webhookCaller = new HTTPClient();
                webhookCaller.post("localhost", 8000, "/?node-id=JPK", "Test", function (body: any, statusCode: number) {
                    assert.equal(body, "Node is not active: JPK");
                    assert.equal(statusCode, 404);

                    server.stop(function () {
                        done();
                    });
                });
            });
        });

        it("Handles Multiple Nodes", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);

            server.start(function () {
                let webhookCaller = new HTTPClient();
                webhookCaller.post("localhost", 8000, "/?node-id=JPK&node-id=JPK", "Test", function (body: any, statusCode: number) {
                    assert.equal(body, "Only one node-id should be present in the query");
                    assert.equal(statusCode, 400);

                    server.stop(function () {
                        done();
                    });
                });
            });
        });

        it("Handles No Node", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);

            server.start(function () {
                let webhookCaller = new HTTPClient();
                webhookCaller.post("localhost", 8000, "/", "Test", function (body: any, statusCode: number) {
                    assert.equal(body, "No node specified. Must be included with the querystring as node-id.");
                    assert.equal(statusCode, 400);

                    server.stop(function () {
                        done();
                    });
                });
            });
        });

        it("Handles Uncaught Exception", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);
            let mochaHandler = process.listeners("uncaughtException").pop();
            process.removeListener("uncaughtException", mochaHandler);

            server.start(function () {
                throw new Error("Test");
            });

            setTimeout(function () {
                server.stop(function () {
                    process.addListener("uncaughtException", mochaHandler);
                    done();
                });
            }, 10);
        });
    });

    describe("Receive Ping", function() {
        it("Pings", function(done) {
            this.timeout(2000);
            // Start the server
            let server = new BespokeServer(8000, 9000);
            server.start(function () {
                request.get("http://localhost:8000/ping", function (error: any, response: IncomingMessage, body: Buffer) {
                    assert(!error);
                    assert.equal(response.statusCode, 200);
                    assert.equal(body, "bst-server-" + Global.version());
                    server.stop(function () {
                        done();
                    });
                });
            });
        });
    });

});