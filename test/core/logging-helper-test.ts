/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {Global} from "../../lib/core/global";

import * as winston from "winston";
import {LoggingHelper} from "../../lib/core/logging-helper";

describe("LoggingHelper", function() {
    describe("#initialize", function() {
        it("Logs correctly", function(done) {
            LoggingHelper.initialize(true);
            winston.error("Test", function () {
                done();
            });
        });
    });
});