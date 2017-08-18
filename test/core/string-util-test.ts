import * as assert from "assert";

import {StringUtil} from "../../lib/core/string-util";

describe("HTTPHelper", function() {
    describe("#isIn()", function() {
        it("Checks value is in array", function(done) {
            assert.equal(true, StringUtil.isIn("test", ["test3", "test2", "test"]));
            done();
        });

        it("Checks value is not in array", function(done) {
            assert.equal(false, StringUtil.isIn("tester", ["test3", "test2", "test"]));
            done();
        });
    });

    describe("#rpad()", function() {
        it("Checks rpad", function(done) {
            assert.equal("test####", StringUtil.rpad("test", "#", 8));
            done();
        });

        it("Checks truncate", function(done) {
            assert.equal("BlahBlah", StringUtil.rpad("BlahBlahBlah", "#", 8));
            done();
        });
    });
});