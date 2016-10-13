/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Logless} from "../../lib/logless/logless";

describe("Logless", function() {
    describe("Logging Using the Lambda Context", function() {
        it("Logs stuff on done", function (done) {
            // Need to do this first, as it gets wrapped by Logless.capture
            context.done = function (error: Error, result: any) {
                assert.equal(error, null);
                assert(result);
                done();
            };

            // Confirm all the data that tries to be sent
            mockRequest.write = function (data: string) {
                let json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
                assert.equal(json.source, "JPK");
                assert.equal(json.transactionID.length, 36);
                assert.equal(json.logs.length, 6);
                assert(json.logs[0].payload.request);
                assert.equal(json.logs[0].type, "INFO");
                assert.strictEqual(json.logs[0].tags[0], "request");
                assert.strictEqual(json.logs[1].payload, "I am a log");
                assert.equal(json.logs[1].type, "DEBUG");
                assert.equal(json.logs[2].payload, "I am info");
                assert.equal(json.logs[2].type, "INFO");
                assert.equal(json.logs[3].timestamp.length, 24);
                assert.equal(json.logs[3].type, "WARN");
                assert.equal(json.logs[4].type, "ERROR");
                assert(json.logs[5].payload.response);
                assert(json.logs[5].payload.key, "value");
                assert.strictEqual(json.logs[5].tags[0], "response");
            };

            // Emulate a lambda function
            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                console.log("I am a log");
                console.info("I am info");
                console.warn("I am a warning");
                console.error("I am an error");
                context.done(null, {"response": true, "key": "value"});
            });

            handler.logger.httpRequest = function () {
                return mockRequest;
            };

            handler.call(this, {request: true}, context);
        });

        it("Logs stuff on done with error", function (done) {
            // Need to do this first, as it gets wrapped by Logless.capture
            context.done = function (error: Error, result: any) {
                assert(error);
                done();
            };

            mockRequest.write = function (data: string) {
                let json = JSON.parse(data);
                assert.equal(json.source, "JPK");
                assert.equal(json.logs[1].type, "ERROR");
                assert.equal(json.logs[1].payload, "TestError");
            };

            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                context.done(new Error("TestError"), {"response": true});
            });

            handler.logger.httpRequest = function () {
                return mockRequest;
            };

            handler.call(this, {request: true}, context);
        });
    });

    //     it("Logs stuff on succeed", function(done) {
    //         // Need to do this first, as it gets wrapped by Logless.capture
    //         context.succeed = function (result: any) {
    //             assert(result);
    //             assert(result.response);
    //             done();
    //         };
    //
    //         const logless = Logless.capture("JPK", {request: true}, context);
    //         mockRequest.write = function(data: string) {
    //             let json = JSON.parse(data);
    //             assert.equal(json.source, "JPK");
    //         };
    //
    //         (<any> logless)._queue.httpRequest = function () {
    //             return mockRequest;
    //         };
    //
    //         context.succeed({"response": true});
    //     });
    //
    //     it("Logs stuff on fail", function(done) {
    //         // Need to do this first, as it gets wrapped by Logless.capture
    //         context.fail = function (error: Error) {
    //             assert(error);
    //             assert.equal(error.message, "Test");
    //             done();
    //         };
    //
    //         const logless = Logless.capture("JPK", {request: true}, context);
    //         console.log("I am a log");
    //
    //         mockRequest.write = function(data: string) {
    //             let json = JSON.parse(data);
    //             assert.equal(json.source, "JPK");
    //         };
    //
    //         (<any> logless)._queue.httpRequest = function () {
    //             return mockRequest;
    //         };
    //
    //         context.fail(new Error("Test"));
    //     });
    // });
    //
    // describe("Logging Stuff on Callback", function() {
    //     it("Logs stuff on callback with results", function (done) {
    //         const logless = Logless.captureWithCallback("JPK", {request: true}, context, function (error: Error, result: any) {
    //             assert(result);
    //             done();
    //         });
    //         console.log("I am a log");
    //
    //         mockRequest.write = function (data: string) {
    //             let json = JSON.parse(data);
    //             console.log(JSON.stringify(json, null, 2));
    //             assert.equal(json.source, "JPK");
    //             assert.equal(json.transactionID.length, 36);
    //             assert.equal(json.logs.length, 3);
    //             assert.strictEqual(json.logs[0].payload, "{\"request\":true}");
    //             assert.strictEqual(json.logs[1].payload, "I am a log");
    //             assert.strictEqual(json.logs[2].payload, "{\"response\":true}");
    //             assert.strictEqual(json.logs[2].tags[0], "response");
    //         };
    //
    //         (<any> logless)._queue.httpRequest = function () {
    //             return mockRequest;
    //         };
    //
    //         logless.callback().call(this, null, {"response": true});
    //     });
    // });
});

const context = {
    done: function (error: Error, result: any) {

    },

    succeed: function(result: any) {

    },

    fail: function(error: Error) {

    }
};

const mockRequest = {
    write: function(data: string) {

    },

    end: function() {

    }
};