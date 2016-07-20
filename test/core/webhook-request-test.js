"use strict";
const webhook_request_1 = require("../../lib/core/webhook-request");
const buffer_util_1 = require("../../lib/core/buffer-util");
const assert = require("assert");
const fs = require("fs");
describe("WebhookRequest", function () {
    describe("SimplePost", function () {
        it("All Data At Once", function (done) {
            let request = new webhook_request_1.WebhookRequest();
            let buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            request.append(buffer);
            assert.ok(request.body.indexOf("version") !== -1);
            assert.equal(request.headers["Content-Length"], 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            done();
        });
    });
    describe("TwoPartPost", function () {
        it("Data Split In Two", function (done) {
            let request = new webhook_request_1.WebhookRequest();
            let buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let bufferString = buffer.toString();
            console.log("BUFFER: " + buffer_util_1.BufferUtil.prettyPrint(buffer));
            let buffer1 = bufferString.substr(0, bufferString.indexOf("38Z"));
            let buffer2 = bufferString.substr(bufferString.indexOf("38Z"));
            request.append(Buffer.from(buffer1));
            request.append(Buffer.from(buffer2));
            assert.ok(request.body.indexOf("version") !== -1);
            assert.equal(request.headers["Content-Length"], 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            assert.equal(request.done(), true);
            done();
        });
    });
    describe("#nodeID", function () {
        it("Returns null when not specified", function (done) {
            let buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let bufferString = buffer.toString();
            bufferString = bufferString.replace("node-id", "dummy");
            let request = new webhook_request_1.WebhookRequest();
            request.append(Buffer.from(bufferString));
            assert.equal(request.nodeID(), null);
            done();
        });
        it("Returns value when specified", function (done) {
            let buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let request = new webhook_request_1.WebhookRequest();
            request.append(buffer);
            assert.equal(request.nodeID(), "JPK");
            done();
        });
    });
});
//# sourceMappingURL=webhook-request-test.js.map