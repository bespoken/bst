/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {ArgHelper} from "../../lib/core/arg-helper";
import {Global} from "../../lib/core/global";

import * as winston from "winston";
import {LoggingHelper} from "../../lib/core/logging-helper";

describe("LoggingHelper", function() {
    describe("#initialize", function() {
        it("Logs correctly", function(done) {
            LoggingHelper.initialize();
            winston.error("Test", function () {
                done();
            });
        });
    });
});