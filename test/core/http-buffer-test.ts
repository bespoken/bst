import * as assert from "assert";
import {BufferUtil} from "../../lib/core/buffer-util";
import {HTTPChunk, HTTPBuffer} from "../../lib/core/http-buffer";

describe("HTTPBuffer", function() {
    describe("HTTPResponse tests", function() {
        it("Basic chunked payload", function (done) {
            let data = BufferUtil.fromString("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nTransfer-Encoding: chunked\r\n\r\na\r\n1234567890\r\n0\r\n\r\n");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data);
            assert(httpBuffer.complete());
            assert(httpBuffer.hasHeader("Content-Type"));
            assert.equal(httpBuffer.body(), "1234567890");
            assert.equal(httpBuffer.statusCode(), 200);
            done();
        });

        it("Basic chunked payload as json", function (done) {
            let data = BufferUtil.fromString("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nTransfer-Encoding: chunked\r\n\r\ne\r\n{\"test\": true}\r\n0\r\n\r\n");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data);
            assert(httpBuffer.complete());
            assert(httpBuffer.hasHeader("Content-Type"));
            assert(httpBuffer.bodyAsJSON().test);
            done();
        });

        it("Basic chunked payload split up", function (done) {
            let data1 = BufferUtil.fromString("HTTP/1.1 200 OK\r\nContent-Type: ");
            let data2 = BufferUtil.fromString("application/json\r\nTransfer-Encoding: chunked\r\n\r\na\r\n1234567890\r\n0\r\n\r\n");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data1);
            // Everything should be undefined
            assert(!httpBuffer.complete());
            assert.equal(httpBuffer.body(), undefined);
            assert.equal(httpBuffer.statusCode(), undefined);

            // Now we add the second portion and it should be complete
            httpBuffer.append(data2);
            assert.equal(httpBuffer.body(), "1234567890");

            done();
        });

        it("Chunked payload, headers and body split", function (done) {
            // I would not expect this test to be necessary, but this happened
            //  A payload came in two parts, exactly split between header and body
            //  In this case, the header is defined, but no body yet, and that ends up in an undefined error!
            let headers = BufferUtil.fromString("POST /test?this=1 HTTP/1.1\r\nContent-Type: application/json; charset=utf-8\r\nTransfer-Encoding: chunked\r\n\r\n");
            let body = BufferUtil.fromString("a\r\n1234567890\r\n0\r\n\r\n");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(headers);
            httpBuffer.complete();
            httpBuffer.append(body);
            assert(httpBuffer.complete());
            assert(httpBuffer.hasHeader("Content-Type"));
            assert.equal(httpBuffer.body(), "1234567890");
            assert.equal(httpBuffer.statusCode(), undefined);
            assert.equal(httpBuffer.method(), "POST");
            assert.equal(httpBuffer.uri(), "/test?this=1");
            done();
        });


        it("Advanced chunked payload", function (done) {
            // Got this directly from actual sniffing of payloads
            //  {"version":"1.0","response":{"shouldEndSession":true,"card":{"type":"Simple","title":"Playing Episode 140","content":"Playing Episode 140"},"directives":[{"type":"AudioPlayer.Play","playBehavior":"REPLACE_ALL","audioItem":{"stream":{"url":"https://feeds.soundcloud.com/stream/275202399-amazon-web-services-306355661-amazon-web-services.mp3","token":"0","expectedPreviousToken":null,"offsetInMilliseconds":0}}}]},"sessionAttributes":{"playOrder":[0,1,2,3,4,5],"index":0,"offsetInMilliseconds":0,"loop":true,"shuffle":false,"playbackIndexChanged":false,"enqueuedToken":null,"STATE":"_PLAY_MODE"}}
            let data = BufferUtil.fromString("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nDate: Fri, 02 Sep 2016 18:09:26 GMT\r\nConnection: keep-alive\r\nTransfer-Encoding: chunked\r\n\r\n252\r\n{\"version\":\"1.0\",\"response\":{\"shouldEndSession\":true,\"card\":{\"type\":\"Simple\",\"title\":\"Playing Episode 140\",\"content\":\"Playing Episode 140\"},\"directives\":[{\"type\":\"AudioPlayer.Play\",\"playBehavior\":\"REPLACE_ALL\",\"audioItem\":{\"stream\":{\"url\":\"https://feeds.soundcloud.com/stream/275202399-amazon-web-services-306355661-amazon-web-services.mp3\",\"token\":\"0\",\"expectedPreviousToken\":null,\"offsetInMilliseconds\":0}}}]},\"sessionAttributes\":{\"playOrder\":[0,1,2,3,4,5],\"index\":0,\"offsetInMilliseconds\":0,\"loop\":true,\"shuffle\":false,\"playbackIndexChanged\":false,\"enqueuedToken\":null,\"STATE\":\"_PLAY_MODE\"}}\r\n0\r\n\r\n");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data);
            assert(httpBuffer.complete());
            assert.equal(httpBuffer.statusCode(), 200);
            let json = httpBuffer.bodyAsJSON();
            assert.equal(json.response.shouldEndSession, true);
            assert.equal(json.response.card.type, "Simple");
            done();
        });

        it("Advanced broken up chunked payload", function (done) {
            // Got this directly from actual sniffing of payloads
            //  {"version":"1.0","response":{"shouldEndSession":true,"card":{"type":"Simple","title":"Playing Episode 140","content":"Playing Episode 140"},"directives":[{"type":"AudioPlayer.Play","playBehavior":"REPLACE_ALL","audioItem":{"stream":{"url":"https://feeds.soundcloud.com/stream/275202399-amazon-web-services-306355661-amazon-web-services.mp3","token":"0","expectedPreviousToken":null,"offsetInMilliseconds":0}}}]},"sessionAttributes":{"playOrder":[0,1,2,3,4,5],"index":0,"offsetInMilliseconds":0,"loop":true,"shuffle":false,"playbackIndexChanged":false,"enqueuedToken":null,"STATE":"_PLAY_MODE"}}
            let data1 = BufferUtil.fromString("HTTP/1.1 200 OK\r\nContent-Type: application/");
            let data2 = BufferUtil.fromString("json\r\nDate: Fri, 02 Sep 2016 18:09:26 GMT\r\nConnection: keep-alive\r\nTransfer-Encoding: chunked\r\n\r\n252\r\n");
            let data3 = BufferUtil.fromString("{\"version\":\"1.0\",\"response\":{\"shouldEndSession\":true,\"card\":{\"type\":\"Simple\",\"title\":\"Playing Episode 140\",\"content\":\"Playing Episode 140\"},\"directives\":[{\"type\":\"AudioPlayer.Play\",\"playBehavior\":\"REPLACE_ALL\",\"audioItem\":{\"stream\":{\"url\":\"https://feeds.soundcloud.com/stream/275202399-amazon-web-services-306355661-amazon-web-services.mp3\",\"token\":\"0\",\"expectedPreviousToken\":null,\"offsetInMilliseconds\":0}}}]},\"sessionAttributes\":{\"playOrder\":[0,1,2,3,4,5],\"index\":0,\"offsetInMilliseconds\":0,\"loop\":true,\"shuffle\":false,\"playbackIndexChanged\":false,\"enqueuedToken\":null,\"STATE\":\"_PLAY_MODE\"}}\r\n0\r\n\r\n");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data1);

            // Everything should be undefined
            assert(!httpBuffer.complete());
            assert.equal(httpBuffer.body(), undefined);
            assert.equal(httpBuffer.statusCode(), undefined);

            httpBuffer.append(data2);
            assert.equal(httpBuffer.header("Content-Type"), "application/json");
            assert.equal(httpBuffer.body(), undefined);
            assert(!httpBuffer.complete());

            httpBuffer.append(data3);
            assert(httpBuffer.complete());
            done();
        });
    });

    describe("HTTPRequest tests", function() {
        it("Basic request payload", function (done) {
            let data = BufferUtil.fromString("POST /test?this=1 HTTP/1.1\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 10\r\n\r\n1234567890");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data);
            assert(httpBuffer.complete());
            assert(httpBuffer.hasHeader("Content-Type"));
            assert.equal(httpBuffer.body(), "1234567890");
            assert.equal(httpBuffer.statusCode(), undefined);
            assert.equal(httpBuffer.method(), "POST");
            assert.equal(httpBuffer.uri(), "/test?this=1");
            done();
        });

        it("Basic request payload, no content-length", function (done) {
            let data = BufferUtil.fromString("POST /test?this=1 HTTP/1.1\r\nContent-Type: application/json; charset=utf-8\r\n\r\n1234567890");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(data);
            assert(httpBuffer.complete());
            assert(httpBuffer.hasHeader("Content-Type"));
            assert.equal(httpBuffer.body(), "1234567890");
            assert.equal(httpBuffer.statusCode(), undefined);
            assert.equal(httpBuffer.method(), "POST");
            assert.equal(httpBuffer.uri(), "/test?this=1");
            done();
        });

        it("Basic request payload, headers and body split", function (done) {
            // I would not expect this test to be necessary, but this happened
            //  A payload came in two parts, exactly split between header and body
            //  In this case, the header is defined, but no body yet, and that ends up in an undefined error!
            let headers = BufferUtil.fromString("POST /test?this=1 HTTP/1.1\r\nContent-Type: application/json; charset=utf-8\r\n\r\n");
            let body = BufferUtil.fromString("1234567890");
            let httpBuffer = new HTTPBuffer();
            httpBuffer.append(headers);
            httpBuffer.complete();
            httpBuffer.append(body);
            assert(httpBuffer.complete());
            assert(httpBuffer.hasHeader("Content-Type"));
            assert.equal(httpBuffer.body(), "1234567890");
            assert.equal(httpBuffer.statusCode(), undefined);
            assert.equal(httpBuffer.method(), "POST");
            assert.equal(httpBuffer.uri(), "/test?this=1");
            done();
        });

        it("Error response payload", function (done) {
            // I would not expect this test to be necessary, but this happened
            //  A payload came in two parts, exactly split between header and body
            //  In this case, the header is defined, but no body yet, and that ends up in an undefined error!
            let message = "This is an error that occurred";

            let buffer = HTTPBuffer.errorResponse("This is an error that occurred");
            assert.equal(buffer.raw().toString(), "HTTP/1.1 500 Error\r\nContent-Type: text/plain" +
                "\r\nContent-Length: " + message.length + "\r\n\r\n" +
                "This is an error that occurred");
            done();
        });
    });
});

describe("HTTPChunk", function() {
    describe("#parse()", function() {
        it("Finds chunk", function (done) {
            let chunk = HTTPChunk.parse(BufferUtil.fromString("a\r\n1234567890ABC"));
            assert.equal(chunk.length(), 10);
            assert.equal(chunk.headerLength(), 3);
            assert.equal(chunk.body.toString(), "1234567890");
            done();
        });

        it("Finds another chunk", function (done) {
            let chunk = HTTPChunk.parse(BufferUtil.fromString("14\r\n12345678901234567890"));
            assert.equal(chunk.length(), 20);
            assert.equal(chunk.headerLength(), 4);
            assert.equal(chunk.body.toString(), "12345678901234567890");
            done();
        });

        it("Finds incomplete chunk", function (done) {
            let chunk = HTTPChunk.parse(BufferUtil.fromString("14\r\n1234567890"));
            assert(chunk === null);
            done();
        });

        it("Finds incomplete chunk header", function (done) {
            let chunk = HTTPChunk.parse(BufferUtil.fromString("14\r"));
            assert(chunk === null);
            done();
        });
    });

    describe("#parseLength()", function() {
        it("Finds chunk length", function (done) {
            let length = HTTPChunk.parseLength(BufferUtil.fromString("1\r\n"));
            assert.equal(length, "1");

            length = HTTPChunk.parseLength(BufferUtil.fromString("a\r\n"));
            assert.equal(length, "a");

            length = HTTPChunk.parseLength(BufferUtil.fromString("E\r\n"));
            assert.equal(length, "E");

            length = HTTPChunk.parseLength(BufferUtil.fromString("10000\r\n"));
            assert.equal(length, "10000");
            done();
        });

        it("Finds bad chunk", function (done) {
            try {
                HTTPChunk.parseLength(BufferUtil.fromString("45G\r\n"));
                assert(false, "This should never be reached");
            } catch (e) {
                assert(e.message.indexOf("Invalid character") !== -1);
            }
            done();
        });

        it("Finds no chunk", function (done) {
            let length = HTTPChunk.parseLength(BufferUtil.fromString("45a"));
            assert.equal(length, null);
            done();
        });
    });
});