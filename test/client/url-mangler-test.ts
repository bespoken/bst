/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";

describe("URLMangler", function() {
    describe("#mangle()", function() {
        it("Mangles a URL without a query string", function(done) {
            let newUrl = URLMangler.mangle("http://myservice.xapp.com:5000/test", "JPK");
            assert.equal(newUrl, "https://" + Global.BespokeServerHost + "/test?node-id=JPK");
            done();
        });

        it("Mangles a URL with a query string", function(done) {
            let newUrl: string = URLMangler.mangle("http://myservice.xapp.com:5000/test?test=2", "BST");
            assert.equal(newUrl, "https://" + Global.BespokeServerHost + "/test?test=2&node-id=BST");
            done();
        });
    });

    describe("#mangleNoPath()", function() {
        it("Mangles a URL without a path", function(done) {
            let newUrl = URLMangler.mangleNoPath("JPK");
            assert.equal(newUrl, "https://" + Global.BespokeServerHost + "?node-id=JPK");
            done();
        });
    });

    describe("#mangleJustPath()", function() {
        it("Mangles a URL without a path", function(done) {
            let newUrl = URLMangler.mangleJustPath("/YOUR/PATH", "JPK");
            assert.equal(newUrl, "https://" + Global.BespokeServerHost + "/YOUR/PATH?node-id=JPK");
            done();
        });
    });
});