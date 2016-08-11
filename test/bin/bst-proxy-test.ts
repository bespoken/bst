/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as mockery from "mockery";
import * as program from "commander";
import * as TypeMoq from "typemoq";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";
import {NodeUtil} from "../../lib/core/node-util";
import {exec} from "child_process";
import SinonSandbox = Sinon.SinonSandbox;
import SinonMockStatic = Sinon.SinonMockStatic;

describe("bst-proxy", function() {
    let mockModule: any = {
        BSTProxy: {
            http: function (nodeID: string, targetPort: number) {
                assert.equal(nodeID, "JPK");
                assert.equal(targetPort, 9000);
                return this;
            },

            lambda: function (nodeID: string, lambdaFile: string) {
                assert.equal(nodeID, "JPK");
                assert.equal(lambdaFile, "lambda.js");
                return this;
            }
        }
    };
    let mockProxy: any = mockModule.BSTProxy;

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/client/bst-proxy", mockModule);
    });

    afterEach(function () {
        mockery.disable();
    });

    describe("Help command", function() {
        let originalFunction: any = null;
        beforeEach (function () {
            originalFunction = process.stdout.write;
        });

        afterEach (function () {
            process.stdout.write = originalFunction;
        });

        it("Prints help with no-args", function(done) {
            process.argv = command("node bst-proxy.js");

            let capture: string = "";
            (<any> process.stdout).write = function (data: Buffer) {
                let dataString: string = data.toString();
                if (dataString.indexOf("Usage") !== -1) {
                    done();
                }
            }

            NodeUtil.runJS("../../bin/bst-proxy.js");
        });
    });

    describe("http command", function() {
        it("Calls HTTP proxy", function(done) {
            process.argv = command("node bst-proxy.js http JPK 9000");
            mockProxy.start = function () {
                done();
            };
            NodeUtil.runJS("../../bin/bst-proxy.js");
        });

        it("Calls HTTP proxy with options", function(done) {
            process.argv = command("node bst-proxy.js --bstHost localhost --bstPort 9000 http JPK 9000");

            let optionsSet = false;
            mockProxy.start = function () {
                if (!optionsSet) {
                    assert.fail("Options not set");
                }
                done();
            };

            mockProxy.bespokenServer = function (host: string, port: number) {
                assert.equal(host, "localhost");
                assert.equal(port, "9000");
                optionsSet = true;
            };

            NodeUtil.runJS("../../bin/bst-proxy.js");
        });

        it("Calls HTTP proxy with short options", function(done) {
            process.argv = command("node bst-proxy.js -h localhost3 -p 9003 http JPK 9000");

            let optionsSet = false;
            mockProxy.start = function () {
                if (!optionsSet) {
                    assert.fail("Options not set");
                }
                done();
            };

            mockProxy.bespokenServer = function (host: string, port: number) {
                assert.equal(host, "localhost3");
                assert.equal(port, "9003");
                optionsSet = true;
            };


            NodeUtil.runJS("../../bin/bst-proxy.js");
        });
    });

    describe("lambda command", function() {
        it("Calls Lambda proxy", function(done) {
            process.argv = command("node bst-proxy.js lambda JPK lambda.js");
            mockProxy.start = function () {
                done();
            };
            NodeUtil.runJS("../../bin/bst-proxy.js");
        });

        it("Calls Lambda proxy with options", function(done) {
            process.argv = command("node bst-proxy.js -h localhost2 -p 9001 lambda JPK lambda.js");
            let optionsSet = false;
            mockProxy.start = function () {
                if (!optionsSet) {
                    assert.fail("Options not set");
                }
                done();
            };

            mockProxy.bespokenServer = function (host: string, port: number) {
                assert.equal(host, "localhost2");
                assert.equal(port, "9001");
                optionsSet = true;
            };

            NodeUtil.runJS("../../bin/bst-proxy.js");
        });
    });

    describe("urlgen", function() {
        it("Calls urlgen", function(done) {
            process.argv = command("node bst-proxy.js urlgen JPK http://jpk.com/test");

            mockProxy.urlgen = function (nodeID: string, url: string) {
                assert.equal(nodeID, "JPK");
                assert.equal(url, "http://jpk.com/test");
                done();
            };

            NodeUtil.runJS("../../bin/bst-proxy.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};