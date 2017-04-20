/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Global} from "../../lib/core/global";
import {LambdaServer} from "../../lib/client/lambda-server";
import {HTTPClient} from "../../lib/core/http-client";

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
                assert.equal(responseString, "Error: Failure!");
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
                assert.equal(responseString, "TypeError: Cannot read property 'call' of undefined");
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

        it("Uses Callback Successfully", function(done) {
            let runner = new LambdaServer("CallbackLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert(true, o.success);
                runner.stop();
                done();
            });
        });

        it("Uses Callback With Failure", function(done) {
            let runner = new LambdaServer("CallbackLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", doFailure: true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                assert.equal(data.toString(), "Error: Failed!");
                runner.stop();
                done();
            });
        });

        it("Checks Context Stuff", function(done) {
            let runner = new LambdaServer("ContextLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", doFailure: true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                runner.stop();
                done();
            });
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