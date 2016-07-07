/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
var webhook_request_1 = require("../../service/webhook-request");
var buffer_util_1 = require("../../core/buffer-util");
var assert = require("assert");
var fs = require("fs");
describe('WebhookRequest', function () {
    describe('SimplePost', function () {
        it('All Data At Once', function (done) {
            var request = new webhook_request_1.WebhookRequest();
            //Had to run this command to get proper carriage returns in my file:
            //  sed -e 's/$/\r/' WebhookRequest.raw > WebhookRequest.raw
            var buffer = fs.readFileSync('test/service/WebhookRequestProper.raw');
            var bufferString = buffer.toString();
            request.append(buffer);
            assert.ok(request.body.indexOf("version") != -1);
            assert.equal(request.headers["Content-Length"], 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            done();
        });
    });
    describe('TwoPartPost', function () {
        it('Data Split In Two', function (done) {
            var request = new webhook_request_1.WebhookRequest();
            //Had to run this command to get proper carriage returns in my file:
            //  sed -e 's/$/\r/' WebhookRequest.raw > WebhookRequest.raw
            var buffer = fs.readFileSync('test/service/WebhookRequestProper.raw');
            var bufferString = buffer.toString();
            console.log("BUFFER: " + buffer_util_1.BufferUtil.prettyPrint(buffer));
            //Split the buffer into two pieces
            var buffer1 = bufferString.substr(0, bufferString.indexOf("38Z"));
            var buffer2 = bufferString.substr(bufferString.indexOf("38Z"));
            request.append(Buffer.from(buffer1));
            request.append(Buffer.from(buffer2));
            assert.ok(request.body.indexOf("version") != -1);
            assert.equal(request.headers["Content-Length"], 603);
            assert.equal(request.body.length, 603);
            assert.equal(request.rawContents.length, 1481);
            done();
        });
    });
});
function replaceAll(s, val, newVal) {
    while (s.indexOf(val) != -1) {
        s = s.replace(val, newVal);
    }
    return s;
}
//# sourceMappingURL=webhook-request-test.js.map