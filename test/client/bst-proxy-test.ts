/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Global} from "../../lib/core/global";
import {HTTPClient} from "../../lib/core/http-client";
import {BespokeServer} from "../../lib/server/bespoke-server";
import {BSTProxy} from "../../lib/client/bst-proxy";

describe("BSTProxy", function() {
    Global.initializeCLI();
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
                let proxy = BSTProxy.http(9999).bespokenServer("localhost", 3000);
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
                proxy.lambdaPort(2000);
                proxy.start(function () {
                    assert.equal((<any> proxy).lambdaRunner.server.address().port, 2000);

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

    describe("#urlgen()", function() {
        it("Starts and Stops Correctly", function (done) {
            let url = BSTProxy.urlgen("http://jpk.com/test");
            assert.equal(url, "https://proxy.bespoken.tools/test?node-id=" + Global.config().nodeID());
            done();
        });
    });
});