/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as fs from "fs";
import * as sinon from "sinon";
import {BSTConfig} from "../../lib/client/bst-config";
import {exec} from "child_process";
import {ProxyType} from "../../lib/client/bst-proxy";
import {BSTProcess} from "../../lib/client/bst-config";
import SinonSandbox = Sinon.SinonSandbox;

describe("BSTConfig", function() {
    describe("#bootstrap()", function() {
        beforeEach(function (done) {
            exec("rm -rf " + (<any> BSTConfig).configDirectory(), function () {
                done();
            });
        });

        afterEach(function () {

        });

        it("Test new config created correctly", function (done) {
            (<any> BSTConfig).bootstrapIfNeeded();
            assert(fs.existsSync((<any> BSTConfig).configPath()));
            done();
        });

        it("Loads existing config", function (done) {
            // Make sure we have a new one
            let config = BSTConfig.load();
            let nodeID = config.nodeID();

            // Make sure it does not get created again
            let config2 = BSTConfig.load();
            assert(config2.nodeID(), nodeID);
            done();
        });

    });
});

describe("BSTProcess", function() {
    describe("#run()", function() {
        let sandbox: SinonSandbox = null;
        beforeEach(function (done) {
            exec("rm -rf " + (<any> BSTConfig).configDirectory(), function () {
                done();
            });

            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it("Test new process written", function (done) {
            BSTConfig.load();
            BSTProcess.run(9000, ProxyType.LAMBDA, 9999);

            let data = fs.readFileSync((<any> BSTProcess).processPath());
            let dataJSON = JSON.parse(data.toString());
            assert(dataJSON);
            assert.equal(dataJSON.pid, 9999);
            done();
        });

        it("Test existing process loaded", function (done) {
            BSTConfig.load();
            BSTProcess.run(9000, ProxyType.LAMBDA, 9999);

            // We stub is running because that is tricky to test
            sandbox.stub(BSTProcess, "isRunning", function (pid: string) {
                assert.equal(pid, 9999);
                return true;
            });

            let p = BSTProcess.running();
            assert.equal(p.pid, 9999);
            done();
        });

        it("Test existing process not running", function (done) {
            BSTConfig.load();
            BSTProcess.run(9000, ProxyType.LAMBDA, 9999);

            // We stub is running because that is tricky to test
            sandbox.stub(BSTProcess, "isRunning", function (pid: string) {
                assert.equal(pid, 9999);
                return false;
            });

            let p = BSTProcess.running();
            assert(p === null);
            done();
        });

    });
});