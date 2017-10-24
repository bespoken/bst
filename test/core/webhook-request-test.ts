import {WebhookRequest} from "../../lib/core/webhook-request";
import {BufferUtil} from "../../lib/core/buffer-util";
import * as assert from "assert";
import * as fs from "fs";

describe("WebhookRequest", function() {
    describe("SimplePost", function() {
        it("All Data At Once", function (done) {
            const request = new WebhookRequest(null);
            // Had to run this command to get proper carriage returns in my file:
            //  sed -e 's/$/\r/' WebhookRequest.raw > WebhookRequest.raw
            const buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            request.append(buffer);

            assert.ok(request.body.indexOf("version") !== -1);
            assert.equal(request.contentLength(), 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            done();
        });

        it("Has lower-case headers", function (done) {
            const request = new WebhookRequest();
            const requestString = "POST /?node-id=JPK HTTP/1.1\r\nContent-Type: application/json\r\ncontent-length: 0\r\n\r\n";
            request.append(new Buffer(requestString));
            assert.equal(request.contentLength(), 0);
            assert.equal(request.body.length, 0);
            assert.equal(request.rawContents.length, 82);
            assert.equal(request.nodeID(), "JPK");
            done();
        });

        it("Has path", function (done) {
            const request = new WebhookRequest();
            const requestString = "POST /dev?node-id=JPK HTTP/1.1\r\nContent-Type: application/json\r\ncontent-length: 0\r\n\r\n";
            request.append(new Buffer(requestString));
            assert.equal(request.contentLength(), 0);
            assert.equal(request.nodeID(), "JPK");
            done();
        });
    });

    describe("TwoPartPost", function() {
        it("Data Split In Two", function(done) {
            const request = new WebhookRequest(null);
            // Had to run this command to get proper carriage returns in my file:
            //  sed -e 's/$/\r/' WebhookRequest.raw > WebhookRequest.raw
            const buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            const bufferString: string = buffer.toString();

            console.log("BUFFER: " + BufferUtil.prettyPrint(buffer));
            // Split the buffer into two pieces
            const buffer1 = bufferString.substr(0, bufferString.indexOf("38Z"));
            const buffer2 = bufferString.substr(bufferString.indexOf("38Z"));

            request.append(BufferUtil.fromString(buffer1));
            request.append(BufferUtil.fromString(buffer2));

            assert.ok(request.body.indexOf("version") !== -1);
            assert.equal(request.contentLength(), 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            assert.equal(request.done(), true);
            done();
        });
    });

    describe("#nodeID", function () {
        it("Returns null when not specified", function(done) {
            const buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let bufferString: string = buffer.toString();
            bufferString = bufferString.replace("node-id", "dummy");

            const request = new WebhookRequest(null);
            request.append(BufferUtil.fromString(bufferString));
            assert.equal(request.nodeID(), null);
            done();
        });

        it("Returns value when specified", function(done) {
            const buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");

            const request = new WebhookRequest(null);
            request.append(buffer);
            assert.equal(request.nodeID(), "JPK");
            done();
        });

        it("Returns error when two node-id's", function(done) {
            const buffer: Buffer = fs.readFileSync("test/core/WebhookRequestProper.raw");
            let bufferString: string = buffer.toString();
            bufferString = bufferString.replace("node-id=JPK", "node-id=JPK&node-id=JPK");

            const request = new WebhookRequest(null);
            request.append(BufferUtil.fromString(bufferString));
            try {
                request.nodeID();
                // unreachable because of error
                assert(false);
            } catch (error) {
                done(assert.equal(error.message, "Only one node-id should be present in the query"));
            }
        });
    });
});