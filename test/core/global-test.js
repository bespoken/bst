"use strict";
const global_1 = require("../../core/global");
const winston = require("winston");
describe("Global", function () {
    describe("#initializeLogger", function () {
        it("Logs correctly", function (done) {
            global_1.Global.initializeLogger();
            winston.error("Test", function () {
                done();
            });
        });
    });
});
//# sourceMappingURL=global-test.js.map