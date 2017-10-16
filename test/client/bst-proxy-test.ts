import * as assert from "assert";
import * as mockery from "mockery";

const mockConfig = {
    BSTConfig: {
        load: () => {
            return Promise.resolve({
                secretKey: () => "SECRET_KEY",
            });
        },
    },
};

let BSTProxy;

describe("BSTProxy Programmatic", function () {
    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("./bst-config", mockConfig);
        BSTProxy = require("../../lib/client/bst-proxy").BSTProxy;

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
    let BespokeServer;
    before(async function() {
        this.timeout(10000);

        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("./bst-config", mockConfig);
        mockery.registerMock("../client/bst-config", mockConfig);
        const Global = require("../../lib/core/global").Global;
        await Global.initializeCLI();
        BespokeServer = require("../../lib/server/bespoke-server").BespokeServer;

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