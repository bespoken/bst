/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Logless} from "../../lib/logless/logless";

describe("Logless", function() {
    beforeEach(function () {

    });

    afterEach(function () {

    });

    describe("Logging Using the Lambda Context", function() {
        it("Logs stuff on done", function(done) {
            // Need to do this first, as it gets wrapped by Logless.capture
            context.done = function (error: Error, result: any) {
                assert.equal(error, null);
                assert(result);
                done();
            };

            const logless = Logless.capture("JPK", {request: true}, context);
            console.log("I am a log");
            console.info("I am info");
            console.warn("I am a warning");
            console.error("I am an error");

            mockRequest.write = function(data: string) {
                let json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
                assert.equal(json.source, "JPK");
                assert.equal(json.transactionID.length, 36);
                assert.equal(json.logs.length, 6);
                assert.strictEqual(json.logs[0].payload, "{\"request\":true}");
                assert.equal(json.logs[0].type, "INFO");
                assert.strictEqual(json.logs[0].tags[0], "request");
                assert.strictEqual(json.logs[1].payload, "I am a log");
                assert.equal(json.logs[1].type, "DEBUG");
                assert.equal(json.logs[2].payload, "I am info");
                assert.equal(json.logs[2].type, "INFO");
                assert.equal(json.logs[3].timestamp.length, 24);
                assert.equal(json.logs[3].type, "WARN");
                assert.equal(json.logs[4].type, "ERROR");
                assert.strictEqual(json.logs[5].payload, "{\"response\":true}");
                assert.strictEqual(json.logs[5].tags[0], "response");
            };

            (<any> logless)._queue.httpRequest = function () {
                return mockRequest;
            };

            context.done(null, {"response": true});
        });
    });
});

const context = {
    done: function (error: Error, result: any) {

    },

    succeed: function() {

    },

    fail: function() {

    }
};

const mockRequest = {
    write: function(data: string) {

    },

    end: function() {

    }
};