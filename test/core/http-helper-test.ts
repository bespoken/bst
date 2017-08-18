import * as assert from "assert";

import {HTTPHelper} from "../../lib/core/http-helper";

describe("HTTPHelper", function() {
    describe("#format()", function() {
        it("Returns a response with correct content-length", function(done) {
            let s = HTTPHelper.format(200, "bst-server");
            assert.equal(s, "HTTP/1.0 200 OK\r\nContent-Length: 10\r\n\r\nbst-server");
            done();
        });

        it("Returns a response with correct content-length", function(done) {
            let s = HTTPHelper.format(200, "bst-server2");
            assert.equal(s, "HTTP/1.0 200 OK\r\nContent-Length: 11\r\n\r\nbst-server2");
            done();
        });

        it("Returns a 400 response with correct content-length", function(done) {
            let s = HTTPHelper.format(400, "bst-server2");
            assert.equal(s, "HTTP/1.0 400 Bad Request\r\nContent-Length: 11\r\n\r\nbst-server2");
            done();
        });

        it("Returns a 404 response with correct content-length", function(done) {
            let s = HTTPHelper.format(404, "bst-server2");
            assert.equal(s, "HTTP/1.0 404 Not Found\r\nContent-Length: 11\r\n\r\nbst-server2");
            done();
        });
    });
});