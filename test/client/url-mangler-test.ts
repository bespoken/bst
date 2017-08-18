import * as assert from "assert";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";

describe("URLMangler", function() {
    describe("#mangle()", function() {
        it("Mangles a URL without a query string", function(done) {
            const newUrl = URLMangler.mangle("http://myservice.xapp.com:5000/test", "JPK", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "/test?id=JPK&key=secret");
            done();
        });

        it("Mangles a URL with a query string", function(done) {
            const newUrl: string = URLMangler.mangle("http://myservice.xapp.com:5000/test?test=2", "BST", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "/test?test=2&id=BST&key=secret");
            done();
        });
    });

    describe("#mangleNoPath()", function() {
        it("Mangles a URL without a path", function(done) {
            const newUrl = URLMangler.mangleNoPath("JPK", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "?id=JPK&key=secret");
            done();
        });
    });

    describe("#mangleJustPath()", function() {
        it("Mangles a URL without a path", function(done) {
            const newUrl = URLMangler.mangleJustPath("/YOUR/PATH", "JPK", "secret");
            assert.equal(newUrl, "https://" + Global.SpokesDashboardHost + "/YOUR/PATH?id=JPK&key=secret");
            done();
        });
    });

    describe("#manglePipeToPath()", function() {
        it("Mangles a Pipe with Domain", function(done) {
            const newUrl = URLMangler.manglePipeToPath("JPK");
            assert.equal(newUrl, "https://JPK." + Global.SpokesPipeDomain);
            done();
        });

        it("Mangles a Pipe with Secret Key", function(done) {
            const newUrl = URLMangler.manglePipeToPath("JPK", "secret");
            assert.equal(newUrl, "https://JPK." + Global.SpokesPipeDomain + "?bespoken-key=secret");
            done();
        });
    });
});