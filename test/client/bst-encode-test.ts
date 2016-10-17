/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {BSTEncode} from "../../lib/client/bst-encode";
const AWS = require("aws-sdk");

describe("BSTEncode", function() {
    describe("#encodeAndPublishURL()", function() {
        it("Encodes and Publishes a URL", function (done) {
            const s3 = new AWS.S3();

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/xapp-alexa/UnitTestOutput.mp3", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken/encoded/UnitTestOutput-encoded.mp3");
                done();
            });
        });

        it("Encodes and Publishes a URL that is m4a", function (done) {
            const s3 = new AWS.S3();

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/bespoken/encoded/ContentPromoPromptGood.m4a", function(error: Error, url: string) {
                assert(!error);
                assert.equal(url, "https://s3.amazonaws.com/bespoken/encoded/ContentPromoPromptGood-encoded.mp3");
                done();
            });
        });

        it("Tries to encode bad URL", function (done) {
            const s3 = new AWS.S3();

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/xapp-alexa/UnitTestNotThere.mp3", function(error: Error, url: string) {
                assert(error);
                done();
            });
        });
    });

    describe("#encodeAndPublishFile()", function() {
        it("Encodes and Publishes a file", function (done) {
            this.timeout(10000);
            const s3 = new AWS.S3();

            const config = {
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeFileAndPublish("test/resources/ContentPromoPrompt.m4a", function (error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken/encoded/ContentPromoPrompt-encoded.mp3");
                done();
            });
        });
    });
});
