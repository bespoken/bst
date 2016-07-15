/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";

describe("URLMangler", function() {
    describe("#mangle()", function() {
        it("Mangles a URL without a query string", function(done) {
            let urlMangler = new URLMangler("http://myservice.xapp.com:5000/test", "JPK");
            let newUrl: string = urlMangler.mangle();
            assert.equal(newUrl, "https://" + Global.BespokeServerHost + "/test?node-id=JPK");
            done();
        });

        it("Mangles a URL with a query string", function(done) {
            let urlMangler = new URLMangler("http://myservice.xapp.com:5000/test?test=2", "BST");
            let newUrl: string = urlMangler.mangle();
            assert.equal(newUrl, "https://" + Global.BespokeServerHost + "/test?test=2&node-id=BST");
            done();
        });
    });
});