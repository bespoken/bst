import * as assert from "assert";
import {Global} from "../../lib/core/global";
import {BespokeServer} from "../../lib/server/bespoke-server";
import {BSTProxy} from "../../lib/client/bst-proxy";
import * as mockery from "mockery";

describe("BSTProxy Programmatic", function () {
    let mockConfig = {
        BSTConfig: {
            load: () => {
                return {
                    secretKey: () => "SECRET_KEY",
                };
            },
        },
    };

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("./bst-config", mockConfig);
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
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
        const mockifiedProxy = require("../../lib/client/bst-proxy").BSTProxy;
        let proxy = mockifiedProxy.http(9999);

        proxy.start(() => {
            assert.equal("SECRET_KEY", (proxy as any).bespokenClient.nodeID);
            proxy.stop(() => {
                done();
            });
        });
    });
});

describe("BSTProxy", async function() {
    before(async function() {
        this.timeout(10000);
        await Global.initializeCLI();
    });

    describe("#http()", function() {
        it("Starts and Stops Correctly", function (done) {
            const server = new BespokeServer(4000, 5000);
            server.start(function () {
                const proxy = BSTProxy.http(5000);
                proxy.start(function () {
                    let count = 0;
                    const bothDone = function () {
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
            const server = new BespokeServer(4000, 3000);
            server.start(function () {
                const proxy = BSTProxy.http(9999)
                    .bespokenServer("localhost", 3000);
                proxy.activateSecurity();
                proxy.secretKey("JPK");
                proxy.start(function () {
                    let count = 0;
                    const bothDone = function () {
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
            const server = new BespokeServer(4000, 5000);
            server.start(function () {
                const proxy = BSTProxy.lambda("../resources/ExampleLambda.js");
                proxy.port(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).lambdaServer.server.address().port, 2000);

                    let count = 0;
                    const bothDone = function () {
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
            const server = new BespokeServer(4000, 5000);
            server.start(function () {
                const proxy = BSTProxy.lambda("../resources/ExampleLambdaCustomFunction.js", "myHandler");
                proxy.port(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).lambdaServer.server.address().port, 2000);

                    let count = 0;
                    const bothDone = function () {
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
            const server = new BespokeServer(4000, 5000);
            server.start(function () {
                const proxy = BSTProxy.cloudFunction("../resources/ExampleFunction.js");
                proxy.port(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).functionServer.server.address().port, 2000);

                    let count = 0;
                    const bothDone = function () {
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