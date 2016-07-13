/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {ArgHelper} from "../../core/arg-helper";
import {Global} from "../../core/global";

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