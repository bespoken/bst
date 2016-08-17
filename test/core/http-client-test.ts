/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";

import {HTTPClient} from "../../lib/core/http-client";

describe("HTTPClient", function() {
    describe("#post()", function() {
        it("Handles error", function(done) {
            client = new HTTPClient();
            client.post()
            done();
        });
    });
});
