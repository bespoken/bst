/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Logless} from "../../lib/logless/logless";

describe("Logless", function() {
    beforeEach(function () {

    });

    afterEach(function () {

    });

    describe("Logging Using the Lambda Context", function() {
        it("Logs stuff", function(done) {
            // Need to do this first, as it gets wrapped by Logless.capture
            context.done = function (error: Error, result: any) {
                assert.equal(error, null);
                assert(result);
                done();
            };

            const logless = Logless.capture("JPK", {request: true}, context);
            console.log("I am a log");
            console.warn("I am a warning");

            mockRequest.write = function(data: string) {
                let json = JSON.parse(data);
                console.log(json);
                assert.equal(json.logs.length, 4);
                assert.equal(json.logs[0].message, "{\"request\":true}");
                assert.equal(json.logs[1].message, "I am a log");
                assert.equal(json.logs[1].type, "DEBUG");
                assert.equal(json.logs[1].timestamp.length, 24);
                assert.equal(json.logs[3].message, "{\"response\":true}");
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