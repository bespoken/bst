/// <reference path="../../typings/index.d.ts" />
import * as assert from "assert";
import {BufferUtil} from "../../lib/core/buffer-util";
import {HTTPChunk} from "../../lib/core/http-buffer";

describe("HTTPChunk", function() {
    describe("#scan()", function() {
        it("Finds /r/n", function (done) {
            let index = HTTPChunk.scan(BufferUtil.fromString("45\r\n"), [13, 10]);
            assert.equal(index, 2);
            done();
        });
    });
});