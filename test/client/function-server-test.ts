import * as assert from "assert";
import {FunctionServer} from "../../lib/client/function-server";
import {HTTPClient} from "../../lib/core/http-client";

describe("FunctionServer", function() {
    describe("Handles calls", function () {
        it("Basic JSON Post", function (done) {
            let runner = new FunctionServer("test/resources/ExampleFunction.js", "handler", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function (data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "{\"success\":true}");
                runner.stop();
                done();
            });

        });

        it("Function does not exist", function (done) {
            let runner = new FunctionServer("test/resources/ExampleFunction.js", "handler2", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function (data: Buffer, statusCode: number) {
                let responseString = data.toString();
                assert.equal(responseString, "Function: handler2 does not exist or has not been exported from module: test/resources/ExampleFunction.js");
                assert.equal(statusCode, 500);
                runner.stop();
                done();
            });

        });

        it("Basic JSON Post with Error", function (done) {
            let runner = new FunctionServer("test/resources/ExampleFunction.js", "handler", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", doFailure: true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function (data: Buffer, statusCode: number) {
                let responseString = data.toString();
                assert.equal(responseString, "Failure!");
                assert.equal(statusCode, 500);
                runner.stop();
                done();
            });
        });

        it("Basic JSON Post with Exception", function (done) {
            let runner = new FunctionServer("test/resources/ExampleFunction.js", "handler", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", doException: true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function (data: Buffer, statusCode: number) {
                let responseString = data.toString();
                assert(responseString.startsWith("Unhandled Exception"));
                assert.equal(statusCode, 500);
                runner.stop();
                done();
            });
        });
    });
});