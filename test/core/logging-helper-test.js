"use strict";
const winston = require("winston");
const logging_helper_1 = require("../../lib/core/logging-helper");
describe("LoggingHelper", function () {
    describe("#initialize", function () {
        it("Logs correctly", function (done) {
            logging_helper_1.LoggingHelper.initialize();
            winston.error("Test", function () {
                done();
            });
        });
    });
});
//# sourceMappingURL=logging-helper-test.js.map