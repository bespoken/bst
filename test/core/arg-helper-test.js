"use strict";
const assert = require("assert");
const arg_helper_1 = require("../../core/arg-helper");
describe("ArgHelper", function () {
    describe("#parse()", function () {
        it("Combination of Indexed and Key-Value Args", function (done) {
            let argHelper = new arg_helper_1.ArgHelper(toArray("node script.js test test2 --key value --key2 value2"));
            assert.equal(argHelper.forIndex(0), "test");
            assert.equal(argHelper.forIndex(1), "test2");
            assert.equal(argHelper.forIndex(2), null);
            assert.equal(argHelper.forKey("key"), "value");
            assert.equal(argHelper.forKey("key3"), null);
            done();
        });
        it("Another combination of Indexed and Key-Value Args", function (done) {
            let argHelper = new arg_helper_1.ArgHelper(toArray("node script.js --key value --key2 value2 test test2"));
            assert.equal(argHelper.forIndex(0), "test");
            assert.equal(argHelper.forIndex(1), "test2");
            assert.equal(argHelper.forIndex(2), null);
            assert.equal(argHelper.forKey("key"), "value");
            assert.equal(argHelper.forKey("key3"), null);
            done();
        });
    });
});
function toArray(args) {
    return args.split(" ");
}
//# sourceMappingURL=arg-helper-test.js.map