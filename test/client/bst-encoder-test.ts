/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {BSTEncoder} from "../../lib/client/bst-encoder";
const AWS = require("aws-sdk");

describe("BSTEncoder", function() {
    describe("#encodeAndPublishURL()", function() {
        it("Encodes and Publishes a URL", function (done) {
            const s3 = new AWS.S3();

            const config = {
                region: "us-east-1",
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncoder(config);
            encoder.encodeAndPublishURL("https://s3.amazonaws.com/xapp-alexa/UnitTestOutput.mp3", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.dualstack.us-east-1.amazonaws.com/bespoken/encoded/UnitTestOutput-encoded.mp3");
                done();
            });
        });

        it("Encodes and Publishes a URL that is m4a", function (done) {
            const s3 = new AWS.S3();

            const config = {
                region: "us-east-1",
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncoder(config);
            encoder.encodeAndPublishURL("https://s3.dualstack.us-east-1.amazonaws.com/bespoken/encoded/ContentPromoPrompt.m4a", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.dualstack.us-east-1.amazonaws.com/bespoken/encoded/UnitTestOutput-encoded.mp3");
                done();
            });
        });

        // it("Tries to encode bad URL", function (done) {
        //     const s3 = new AWS.S3();
        //
        //     const config = {
        //         region: "us-east-1",
        //         bucket: "bespoken/encoded",
        //         accessKeyId: s3.config.credentials.accessKeyId,
        //         secretAccessKey: s3.config.credentials.secretAccessKey
        //     };
        //
        //     let encoder = new BSTEncoder(config);
        //     encoder.encodeAndPublishURL("https://s3.amazonaws.com/xapp-alexa/UnitTestNotThere.mp3", function(error: Error, url: string) {
        //         assert(error);
        //         assert(url, "https://s3.dualstack.us-east-1.amazonaws.com/bespoken/encoded/UnitTestOutput-encoded.mp3");
        //         done();
        //     });
        // });
    });

    describe("#encodeAndPublishFile()", function() {
        it("Encodes and Publishes a file", function (done) {
            const s3 = new AWS.S3();

            const config = {
                region: "us-east-1",
                bucket: "bespoken/encoded",
                accessKeyId: s3.config.credentials.accessKeyId,
                secretAccessKey: s3.config.credentials.secretAccessKey
            };

            let encoder = new BSTEncoder(config);
            encoder.encodeAndPublishFile("test/resources/ContentPromoPrompt.m4a", function (error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.dualstack.us-east-1.amazonaws.com/bespoken/encoded/UnitTestOutput-encoded.mp3");
                done();
            });
        });
    });
});
