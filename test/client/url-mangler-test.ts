/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";

describe("URLMangler", function() {
    describe("#mangle()", function() {
        it("Mangles a URL without a query string", function(done) {
            let newUrl = URLMangler.mangle("http://myservice.xapp.com:5000/test", "JPK", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "/test?id=JPK&key=secret");
            done();
        });

        it("Mangles a URL with a query string", function(done) {
            let newUrl: string = URLMangler.mangle("http://myservice.xapp.com:5000/test?test=2", "BST", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "/test?test=2&id=BST&key=secret");
            done();
        });
    });

    describe("#mangleNoPath()", function() {
        it("Mangles a URL without a path", function(done) {
            let newUrl = URLMangler.mangleNoPath("JPK", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "?id=JPK&key=secret");
            done();
        });
    });

    describe("#mangleJustPath()", function() {
        it("Mangles a URL without a path", function(done) {
            let newUrl = URLMangler.mangleJustPath("/YOUR/PATH", "JPK", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "/YOUR/PATH?id=JPK&key=secret");
            done();
        });
    });

    describe("#mangleJustPath()", function() {
        it("Mangles a Pipe with Domain", function(done) {
            let newUrl = URLMangler.manglePipeToPath("JPK");
            assert.equal(newUrl, "https://JPK." + Global.SpokesPipeDomain);
            done();
        });
    });
});