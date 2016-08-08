/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";
import {LambdaRunner} from "../../lib/client/lambda-runner";
import {HTTPClient} from "../../lib/client/http-client";

describe("LambdaRunner", function() {
    describe("#start()", function() {
        it("Starts Correctly", function(done) {
            let runner = new LambdaRunner("test/client/ExampleLambda.js", 9999);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 9999, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal("{\"success\":true}", responseString);
                runner.stop();
                done();
            });

        });

        it("Handles Lambda Fail Correctly", function(done) {
            let runner = new LambdaRunner("test/client/ExampleLambda.js", 9999);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", "doFailure": true};
            client.post("localhost", 9999, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "Failure!");
                runner.stop();
                done();
            });
        });
    });

    describe("#stop()", function() {
        it("Stops Correctly", function(done) {
            let runner = new LambdaRunner("test/client/ExampleLambda.js", 9999);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 9999, "", JSON.stringify(inputData), function(data: Buffer) {
                runner.stop();
                client.post("localhost", 9999, "", JSON.stringify(inputData), function(data: Buffer, success: boolean) {
                    assert.equal(data.toString().indexOf("connect ECONNREFUSED") !== -1, true);
                    assert.equal(success, false);
                    done();
                });
            });

        });
    });
});