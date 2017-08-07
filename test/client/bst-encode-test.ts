import * as assert from "assert";
import {BSTEncode} from "../../lib/client/bst-encode";

const dotenv = require("dotenv");

let awsAccessKeyId: string;
let awsSecretAccessKey: string;

describe("BSTEncode", function() {
    before(function () {
        // Sets up environment variables from .env file
        dotenv.config();

        awsAccessKeyId = process.env["AWS_ACCESS_KEY_ID"];
        awsSecretAccessKey = process.env["AWS_SECRET_ACCESS_KEY"];
    });

    describe("#encodeAndPublishURL()", function() {
        it("Encodes and Publishes a URL", function (done) {
            if (doNotRun(this, done)) return;
            this.timeout(10000);

            const config = {
                bucket: "bespoken-encoding-test",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/xapp-alexa/UnitTestOutput.mp3", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken-encoding-test/UnitTestOutput-encoded.mp3");
                done();
            });
        });

        it("Encodes and Publishes a URL With Volume Modified", function (done) {
            if (doNotRun(this, done)) return;
            this.timeout(10000);

            const config = {
                bucket: "bespoken-encoding-test",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
                filterVolume: 5.0
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublishAs("https://s3.amazonaws.com/xapp-alexa/UnitTestOutput.mp3", "UnitTest-VolumeModified.mp3", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken-encoding-test/UnitTest-VolumeModified.mp3");
                done();
            });
        });

        it("Encodes and Publishes a URL as another name", function (done) {
            if (doNotRun(this, done)) return;
            this.timeout(10000);

            const config = {
                bucket: "bespoken-encoding-test",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublishAs("http://traffic.libsyn.com/bespoken/Introduction.mp3", "UNIT_TEST_INTRODUCTION.mp3", function(error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken-encoding-test/UNIT_TEST_INTRODUCTION.mp3.mp3");
                done();
            });
        });

        it("Encodes and Publishes a URL that is m4a", function (done) {
            if (doNotRun(this, done)) return;
            this.timeout(10000);

            const config = {
                bucket: "bespoken-encoding-test",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeURLAndPublish("https://s3.amazonaws.com/bespoken-encoding-test/ContentPromoPromptGood.m4a", function(error: Error, url: string) {
                console.log(error);
                assert(!error);
                assert.equal(url, "https://s3.amazonaws.com/bespoken-encoding-test/ContentPromoPromptGood-encoded.mp3");
                done();
            });
        });

        it("Tries to encode bad URL", function (done) {
            if (doNotRun(this, done)) return;

            const config = {
                bucket: "bespoken-encoding-test",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
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
            this.timeout(20000);
            if (doNotRun(this, done)) return;

            const config = {
                bucket: "bespoken-encoding-test",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey
            };

            let encoder = new BSTEncode(config);
            encoder.encodeFileAndPublish("test/resources/ContentPromoPrompt.m4a", function (error: Error, url: string) {
                assert(!error);
                assert(url, "https://s3.amazonaws.com/bespoken-encoding-test/ContentPromoPrompt-encoded.mp3");
                done();
            });
        });
    });
});

function doNotRun(test: any, done: Function): boolean {
    if (awsAccessKeyId === undefined || awsSecretAccessKey === undefined) {
        console.warn("AWS dependent test skipped. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be set in the .env file for these tests");
        done();
        return true;
    }
}
