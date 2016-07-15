"use strict";
const assert = require("assert");
const url_mangler_1 = require("../../lib/client/url-mangler");
const global_1 = require("../../lib/core/global");
describe("URLMangler", function () {
    describe("#mangle()", function () {
        it("Mangles a URL without a query string", function (done) {
            let urlMangler = new url_mangler_1.URLMangler("http://myservice.xapp.com:5000/test", "JPK");
            let newUrl = urlMangler.mangle();
            assert.equal(newUrl, "https://" + global_1.Global.BespokeServerHost + "/test?node-id=JPK");
            done();
        });
        it("Mangles a URL with a query string", function (done) {
            let urlMangler = new url_mangler_1.URLMangler("http://myservice.xapp.com:5000/test?test=2", "BST");
            let newUrl = urlMangler.mangle();
            assert.equal(newUrl, "https://" + global_1.Global.BespokeServerHost + "/test?test=2&node-id=BST");
            done();
        });
    });
});
//# sourceMappingURL=url-mangler-test.js.map