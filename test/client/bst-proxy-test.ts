import * as assert from "assert";
import {Global} from "../../lib/core/global";
import {BespokeServer} from "../../lib/server/bespoke-server";
import {BSTProxy} from "../../lib/client/bst-proxy";

describe("BSTProxy Programmatic", function () {
    it("Starts and stops programmatically", function (done) {
        let proxy = BSTProxy.http(9999).secretKey("SECRET_KEY");
        proxy.start(() => {
            assert.equal("SECRET_KEY", (proxy as any).bespokenClient.nodeID);
            proxy.stop(() => {
                done();
            });
        });
    });

    it("Fails to start programmatically without secret key", function (done) {
        let proxy = BSTProxy.http(9999);
        try {
            proxy.start();
        } catch (e) {
            assert(e.message.startsWith("Secret key must be provided"));
            done();
        }
    });
});

describe("BSTProxy", async function() {
    before(async function() {
        this.timeout(10000);
        await Global.initializeCLI();
    });

    describe("#http()", function() {
        it("Starts and Stops Correctly", function (done) {
            let server = new BespokeServer(4000, 5000);
            server.start(function () {
                let proxy = BSTProxy.http(5000);
                proxy.start(function () {
                    let count = 0;
                    let bothDone = function () {
                        count++;
                        if (count === 2) {
                            done();
                        }
                    };

                    proxy.stop(bothDone);
                    server.stop(bothDone);
                });
            });
        });

        it("Starts and Stops Correctly With Options", function (done) {
            let server = new BespokeServer(4000, 3000);
            server.start(function () {
                let proxy = BSTProxy.http(9999)
                    .bespokenServer("localhost", 3000);
                proxy.start(function () {
                    let count = 0;
                    let bothDone = function () {
                        count++;
                        if (count === 2) {
                            done();
                        }
                    };

                    proxy.stop(bothDone);
                    server.stop(bothDone);
                });
            });
        });
    });

    describe("#lambda()", function() {
        it("Starts and Stops Correctly", function (done) {
            let server = new BespokeServer(4000, 5000);
            server.start(function () {
                let proxy = BSTProxy.lambda("../resources/ExampleLambda.js");
                proxy.port(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).lambdaServer.server.address().port, 2000);

                    let count = 0;
                    let bothDone = function () {
                        count++;
                        if (count === 2) {
                            done();
                        }
                    };

                    proxy.stop(bothDone);
                    server.stop(bothDone);
                });
            });
        });

        it("Starts and Stops Correctly With Named Function", function (done) {
            let server = new BespokeServer(4000, 5000);
            server.start(function () {
                let proxy = BSTProxy.lambda("../resources/ExampleLambdaCustomFunction.js", "myHandler");
                proxy.port(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).lambdaServer.server.address().port, 2000);

                    let count = 0;
                    let bothDone = function () {
                        count++;
                        if (count === 2) {
                            done();
                        }
                    };

                    proxy.stop(bothDone);
                    server.stop(bothDone);
                });
            });
        });
    });

    describe("#cloudFunction()", function() {
        it("Starts and Stops Correctly", function (done) {
            let server = new BespokeServer(4000, 5000);
            server.start(function () {
                let proxy = BSTProxy.cloudFunction("../resources/ExampleFunction.js");
                proxy.port(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).functionServer.server.address().port, 2000);

                    let count = 0;
                    let bothDone = function () {
                        count++;
                        if (count === 2) {
                            done();
                        }
                    };

                    proxy.stop(bothDone);
                    server.stop(bothDone);
                });
            });
        });
    });
});