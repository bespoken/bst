import * as assert from "assert";
import * as fs from "fs";
import {FileUtil} from "../../lib/core/file-util";

describe("FileUtil", function() {
    describe("copy()", function () {
        it("Copies a file", function (done) {
            const target = "test/resources/ContentPromoPromptCopy.m4a";
            FileUtil.copyFile("test/resources/ContentPromoPrompt.m4a", target, function () {
                assert.equal(fs.readFileSync(target).length, 607027);
                fs.unlinkSync(target);
                done();
            });
        });

        it("Fails to copy a file - bad source", function (done) {
            const target = "test/resources/ContentPromoPromptCopy.m4a";
            FileUtil.copyFile("test/resources/ContentPromoPromptNotThere.m4a", target, function (error: Error) {
                assert(error);
                done();
            });
        });

        it("Fails to copy a file - bad target", function (done) {
            const target = "testNonExisting/resources/ContentPromoPromptCopy.m4a";
            FileUtil.copyFile("test/resources/ContentPromoPrompt.m4a", target, function (error: Error) {
                assert(error);
                done();
            });
        });
    });

    describe("read()", function() {
        it("Reads and returns a buffer for binary file", function (done) {
            FileUtil.readFile("test/resources/ContentPromoPrompt.m4a", function(data: Buffer) {
                assert(data instanceof Buffer);
                done();
            });
        });

        it("Reads and returns a buffer for text file", function (done) {
            FileUtil.readFile("test/resources/speechAssets/SampleUtterances.txt", function(data: Buffer) {
                assert(data instanceof Buffer);
                done();
            });
        });
    });
});