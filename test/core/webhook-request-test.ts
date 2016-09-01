/// <reference path="../../typings/index.d.ts" />

import {WebhookRequest} from "../../lib/core/webhook-request";
import {BufferUtil} from "../../lib/core/buffer-util";
import * as assert from "assert";
import * as fs from "fs";

describe("WebhookRequest", function() {
    describe("SimplePost", function() {
        it("All Data At Once", function(done) {
            let request = new WebhookRequest(null);
            // Had to run this command to get proper carriage returns in my file:
            //  sed -e 's/$/\r/' WebhookRequest.raw > WebhookRequest.raw
            let buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            request.append(buffer);

            assert.ok(request.body.indexOf("version") !== -1);
            assert.equal(request.headers["Content-Length"], 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            done();
        });
    });

    describe("TwoPartPost", function() {
        it("Data Split In Two", function(done) {
            let request = new WebhookRequest(null);
            // Had to run this command to get proper carriage returns in my file:
            //  sed -e 's/$/\r/' WebhookRequest.raw > WebhookRequest.raw
            let buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let bufferString: string = buffer.toString();

            console.log("BUFFER: " + BufferUtil.prettyPrint(buffer));
            // Split the buffer into two pieces
            let buffer1 = bufferString.substr(0, bufferString.indexOf("38Z"));
            let buffer2 = bufferString.substr(bufferString.indexOf("38Z"));

            request.append(BufferUtil.fromString(buffer1));
            request.append(BufferUtil.fromString(buffer2));

            assert.ok(request.body.indexOf("version") !== -1);
            assert.equal(request.headers["Content-Length"], 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            assert.equal(request.done(), true);
            done();
        });
    });

    describe("#nodeID", function () {
        it("Returns null when not specified", function(done) {
            let buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let bufferString: string = buffer.toString();
            bufferString = bufferString.replace("node-id", "dummy");

            let request = new WebhookRequest(null);
            request.append(BufferUtil.fromString(bufferString));
            assert.equal(request.nodeID(), null);
            done();
        });

        it("Returns value when specified", function(done) {
            let buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");

            let request = new WebhookRequest(null);
            request.append(buffer);
            assert.equal(request.nodeID(), "JPK");
            done();
        });
    });
});