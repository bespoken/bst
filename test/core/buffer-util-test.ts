import * as assert from "assert";
import {BufferUtil} from "../../lib/core/buffer-util";

describe("BufferUtil", function() {

    describe("#scan()", function() {
        it("Finds /r/n", function (done) {
            let index = BufferUtil.scan(BufferUtil.fromString("45\r\n"), [13, 10]);
            assert.equal(index, 2);
            done();
        });

        it("Finds /r/n", function (done) {
            let index = BufferUtil.scan(BufferUtil.fromString("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n"), [13, 10, 13, 10]);
            assert.equal(index, 47);
            done();
        });
    });
});