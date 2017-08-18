import * as assert from "assert";
import {SampleUtterances} from "../../lib/alexa/sample-utterances";
import {Phrase} from "../../lib/alexa/sample-utterances";


describe("SamplesUtterances", function() {
    let sampleUtterancesJSON: any = {
        "TestIntent": ["Test", "Intent"],
        "AnotherTest": ["Another", "AnotherPhrase"],
        "Slots": ["Slot {A} and {B}", "Reversed {B} and {A}"]
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
                assert.equal(utterances.intentForUtterance("Test2").intentName, "Test");
                assert.equal(utterances.intentForUtterance("another test").intentName, "AnotherTest");
                assert.equal(utterances.intentForUtterance("With Slot {JPK}").intentName, "WithSlot");
                assert.equal(utterances.intentForUtterance("With Slot {JPK}").slotValue(0), "JPK");
                done();
            });
        });

        it("Passes error when files does not exist", function(done) {
            SampleUtterances.fromFile("test/alexa/resources/SampleUtterances.tx", function (utterances: SampleUtterances, error?: string) {
                assert(error.indexOf("not found") !== -1);
                done();
            });
        });

        it("No error when bad file with blank line", function(done) {
            SampleUtterances.fromFile("test/alexa/resources/SampleUtterancesBlankLine.txt", function (utterances: SampleUtterances, error?: string) {
                assert(error === undefined);
                assert(utterances);
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

    describe("#intentForUtterance()", function() {
        it("Correctly loads samples", function(done) {
            let samplesUtterances = SampleUtterances.fromJSON(sampleUtterancesJSON);
            assert.equal(samplesUtterances.intentForUtterance("Another").intentName, "AnotherTest");
            assert.equal(samplesUtterances.intentForUtterance("Test").intentName, "TestIntent");
            assert(samplesUtterances.intentForUtterance("Test2") === null);
            done();
        });

        it("Correctly handles slots", function(done) {
            let samplesUtterances = SampleUtterances.fromJSON(sampleUtterancesJSON);
            assert.equal(samplesUtterances.intentForUtterance("Slot {JPK} and {DC}").intentName, "Slots");
            assert.equal(samplesUtterances.intentForUtterance("Slot {JPK} and {DC}").slotName(0), "A");
            assert.equal(samplesUtterances.intentForUtterance("Slot {JPK} and {DC}").slotValue(0), "JPK");
            assert.equal(samplesUtterances.intentForUtterance("Slot {JPK} and {DC}").slotValue(1), "DC");
            assert.equal(samplesUtterances.intentForUtterance("Reversed {JPK} and {DC}").slotName(0), "B");
            assert.equal(samplesUtterances.intentForUtterance("Reversed {JPK} and {DC}").slotValue(0), "JPK");
            done();
        });
    });

    describe("#defaultUtterance()", function() {
        it("Correctly loads samples", function(done) {
            let samplesUtterances = SampleUtterances.fromJSON(sampleUtterancesJSON);
            assert.equal(samplesUtterances.defaultUtterance(), "Test");
            done();
        });
    });
});

describe("Phrase", function() {
    describe("#normalize()", function() {
        it("Correctly parses single slot", function(done) {
            let phrase = new Phrase("Hi {A}");
            assert.equal(phrase.slots.length, 1);
            assert.equal(phrase.slots[0], "A");
            assert.equal(phrase.normalizedPhrase, "Hi {}");
            done();
        });

        it("Correctly parses single slot with extra text", function(done) {
            let phrase = new Phrase("Hi {A} - how are you?");
            assert.equal(phrase.slots.length, 1);
            assert.equal(phrase.slots[0], "A");
            assert.equal(phrase.normalizedPhrase, "Hi {} - how are you?");
            done();
        });

        it("Correctly parses multiple slots", function(done) {
            let phrase = new Phrase("Hi {ABC} - Meet {XYZ}");
            assert.equal(phrase.slots.length, 2);
            assert.equal(phrase.slots[0], "ABC");
            assert.equal(phrase.slots[1], "XYZ");
            assert.equal(phrase.normalizedPhrase, "Hi {} - Meet {}");
            done();
        });

        it("Correctly parses multiple slots in a row", function(done) {
            let phrase = new Phrase("Hi {ABC} {XYZ}");
            assert.equal(phrase.slots.length, 2);
            assert.equal(phrase.slots[0], "ABC");
            assert.equal(phrase.slots[1], "XYZ");
            assert.equal(phrase.normalizedPhrase, "Hi {} {}");
            done();
        });
    });

    describe("#match()", function() {
        it("Correctly matches phrase", function(done) {
            let phrase = new Phrase("Hi {ABC}");
            assert(phrase.matchesUtterance("hi {John}"));
            done();
        });

        it("Correctly matches phrase", function(done) {
            let phrase = new Phrase("With Slot {ABC}");
            assert(phrase.matchesUtterance("With Slot {John}"));
            done();
        });
    });
});
