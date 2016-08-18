/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {SampleUtterances} from "../../lib/alexa/sample-utterances";


describe("SamplesUtterances", function() {
    let sampleUtterancesJSON: any = {
        "TestIntent": ["Test", "Intent"],
        "AnotherTest": ["Another", "Anothers"]
    };

    describe("#fromJSON()", function() {
        it("Correctly loads samples", function(done) {
            let samplesUtterances = SampleUtterances.fromJSON(sampleUtterancesJSON);
            assert(samplesUtterances.hasIntent("TestIntent"));
            assert(samplesUtterances.hasIntent("AnotherTest"));
            done();
        });
    });

    describe("#fromFile()", function() {
        it("Correctly loads sample utterances", function(done) {
            SampleUtterances.fromFile("test/alexa/resources/SampleUtterances.txt", function (utterances: SampleUtterances, error: string) {
                assert(utterances.hasIntent("Test"));
                assert.equal(utterances.intentForPhrase("Test2"), "Test");
                assert.equal(utterances.intentForPhrase("another test"), "AnotherTest");
                done();
            });
        });

        it("Passes error when files does not exist", function(done) {
            SampleUtterances.fromFile("test/alexa/resources/SampleUtterances.tx", function (utterances: SampleUtterances, error?: string) {
                assert(error.indexOf("not found") !== -1);
                done();
            });
        });

        it("Passes error when bad file with blank line", function(done) {
            SampleUtterances.fromFile("test/alexa/resources/SampleUtterancesBlankLine.txt", function (utterances: SampleUtterances, error?: string) {
                assert(error.indexOf("blank line") !== -1);
                done();
            });
        });

        it("Passes error when bad file with no sample", function(done) {
            SampleUtterances.fromFile("test/alexa/resources/SampleUtterancesNoUtterance.txt", function (utterances: SampleUtterances, error?: string) {
                assert.equal(error, "Invalid sample utterance: AnotherTest");
                done();
            });
        });
    });

    describe("#hasIntent()", function() {
        it("Correctly loads samples", function(done) {
            let samplesUtterances = SampleUtterances.fromJSON(sampleUtterancesJSON);
            assert(samplesUtterances.hasIntent("AnotherTest"));
            assert(samplesUtterances.hasIntent("AnotherTest2") === false);
            done();
        });
    });

    describe("#intentForPhrase()", function() {
        it("Correctly loads samples", function(done) {
            let samplesUtterances = SampleUtterances.fromJSON(sampleUtterancesJSON);
            assert.equal(samplesUtterances.intentForPhrase("Another"), "AnotherTest");
            assert.equal(samplesUtterances.intentForPhrase("Test"), "TestIntent");
            assert(samplesUtterances.intentForPhrase("Test2") === null);
            done();
        });
    });
});
