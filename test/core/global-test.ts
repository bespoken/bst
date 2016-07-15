/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {ArgHelper} from "../../lib/core/arg-helper";
import {Global} from "../../lib/core/global";

import * as winston from "winston";

describe("Global", function() {
    describe("#initializeLogger", function() {
        it("Logs correctly", function(done) {
            Global.initializeLogger();
            winston.error("Test", function () {
                done();
            });
        });
    });
});