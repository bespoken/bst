/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as fs from "fs";
import {Global} from "../../lib/core/global";
import {LambdaServer} from "../../lib/client/lambda-server";
import {HTTPClient} from "../../lib/core/http-client";
import {FileUtil} from "../../lib/core/file-util";

Global.initialize();

describe("LambdaServer", function() {
    beforeEach(function () {
        process.chdir("test/resources");
    });

    afterEach(function () {
        process.chdir("../..");
    });

    describe("#start()", function() {
        it("Starts Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "{\"success\":true}");
                runner.stop();
                done();
            });

        });

        it("Handles Lambda Fail Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", "doFailure": true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "Failure!");
                runner.stop();
                done();
            });
        });

        it("Handles Lambda Exception Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambdaBad.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", "doFailure": true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "Exception: Cannot read property 'call' of undefined");
                runner.stop();
                done();
            });
        });

        it("Handles Project Correctly", function(done) {
            process.chdir("exampleProject");
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
                runner.stop();
                process.chdir("..");
                done();
            });
        });

        it("Handles Project Correctly Different Dir", function(done) {
            let runner = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
                runner.stop();
                done();
            });
        });

        it("Handles Reload Correctly", function(done) {
            let tempFile = "ExampleLambdaCopy.js";
            FileUtil.copyFile("ExampleLambda.js", tempFile, function() {
                let runner = new LambdaServer(tempFile, 10000);
                runner.start();

                let firstTime = true;
                (<any> runner).onDirty = function () {
                    // Make sure we only react to first callback
                    if (firstTime) {
                        firstTime = false;
                    } else {
                        return;
                    }
                    client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                        let o = JSON.parse(data.toString());
                        assert.equal(o.success, true);
                        assert.equal(o.reloaded, true);
                        runner.stop(function () {
                            done();
                        });
                    });
                };

                let client = new HTTPClient();
                let inputData = {"data": "Test"};
                client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                    let o = JSON.parse(data.toString());
                    assert.equal(o.success, true);
                    assert.notEqual(o.hasOwnProperty("reloaded"), true);

                    FileUtil.copyFile("ExampleLambda2.js", tempFile, function() {

                    });
                });
            });
        });

        it("Handles Reload Exclusions Correctly", function(done) {
            let sourceFile = "ExampleLambda.js";
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            fs.mkdirSync("node_modules");

            (<any> runner).onDirty = function (filename: string) {
                if (filename === "ExampleLambdaCopy.js") {
                    // We some times get the change from the previous test - we can ignore it
                } else {
                    assert(false, "Should not be called");
                }
            };

            FileUtil.copyFile(sourceFile, "ExampleLambda.js___");
            FileUtil.copyFile(sourceFile, ".dummy");
            FileUtil.copyFile(sourceFile, "node_modules/CopiedLambda.js");

            setTimeout(function () {
                fs.unlinkSync("ExampleLambda.js___");
                fs.unlinkSync(".dummy");
                fs.unlinkSync("node_modules/CopiedLambda.js");
                fs.rmdirSync("node_modules");
                runner.stop(function () {
                    done();
                });
            }, 100);
        });

        it("Handles No Reload after stop", function(done) {
            let tempFile = "ExampleLambdaCopy.js";
            let runner = new LambdaServer(tempFile, 10000);
            let dirtyCalled = false;
            (<any> runner).onDirty = function () {
                dirtyCalled = true;
            };

            runner.start(function () {
                runner.stop();
                FileUtil.copyFile("ExampleLambda.js", tempFile, function() {

                });
            });

            setTimeout(function () {
                assert.equal(dirtyCalled, false);
                done();
            }, 100);
        });

        it("Handles Two at once", function(done) {
            let runner = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
            });

            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
                runner.stop();
                done();
            });
        });

        it("Handles Ping", function(done) {
            let tempFile = "ExampleLambdaCopy.js";
            let runner = new LambdaServer(tempFile, 10000);

            runner.start(function () {
                new HTTPClient().get("localhost", 10000, "", function (data: Buffer, statusCode: number) {
                    assert.equal(statusCode, 200);
                    assert.equal(data.length, 5);
                    runner.stop(function () {
                        done();
                    });
                });
            });
        });
    });

    describe("#stop()", function() {
        it("Stops Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function() {
                runner.stop();
                client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer, statusCode: number, success: boolean) {
                    assert.equal(data.toString().indexOf("connect ECONNREFUSED") !== -1, true);
                    assert.equal(success, false);
                    done();
                });
            });

        });
    });
});