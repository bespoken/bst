/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {InteractionModel} from "../../lib/alexa/interaction-model";
import {SampleUtterances} from "../../lib/alexa/sample-utterances";
import {Alexa} from "../../lib/alexa/alexa";


describe("Alexa", function() {
    // The intentName schema we will use in these tests
    let intentSchemaJSON = {
        "intents": [
            {"intent": "NearestLocation"},
            {"intent": "AnotherIntent"},
            {"intent": "TakeMeToWalmart", "slots": [
                {"name": "SlotName", "type": "SLOT_TYPE"}
            ]}
        ]
    };

    let sampleUtterancesJSON = {
        "NearestLocation": ["Nearest Location", "Location"],
        "TakeMeToWalmart": ["Take Me To Walmart {SlotName}"],
        "NoMatchingIntent": ["No Matching"]
    };

    let model = new InteractionModel(
        new IntentSchema(intentSchemaJSON),
        SampleUtterances.fromJSON(sampleUtterancesJSON));

    let alexa = new Alexa();

    describe("#spoken", function() {
        it("Returns payload", function(done) {
            this.timeout(10000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";

            alexa.startSession(skillURL, model, false).spoken("Nearest Location", function (request: any, response: any) {
                assert(request);
                assert(response.response.outputSpeech.ssml !== null);
                assert.equal(response.response.outputSpeech.ssml, "<speak><audio src=\"https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-NEARESTLOCATION-TRAILING.mp3\" /></speak>");
                done();
            });
        });

        it("Handle With Slot", function(done) {
            this.timeout(10000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("Take Me To Walmart {A}", function (request: any, response: any) {
                assert(response.response.outputSpeech.ssml !== null);
                assert.equal(response.response.outputSpeech.ssml, "<speak><audio src=\"https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3\" /></speak>");
                done();
            });
        });

        it("Handles error on bad URL", function(done) {
            this.timeout(5000);
            let skillURL = "https://alexa.xappmedia.xyz/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("Nearest Location", function (request: any, response: any, error: string) {
                assert(error);
                assert.equal(error, "getaddrinfo ENOTFOUND alexa.xappmedia.xyz alexa.xappmedia.xyz:443");
                done();
            });
        });

        it("Handles error on bad Intent", function(done) {
            this.timeout(10000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("No Matching", function (request: any, response: any, error: string) {
                assert(error);
                assert.equal(error, "Interaction model has no intentName named: NoMatchingIntent");
                done();
            });
        });

        it("Handles default on bad Phrase", function(done) {
            this.timeout(10000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("NotMatching", function (request: any, response: any) {
                // Treats this as the first intentName, Nearest Location
                assert.equal(response.response.outputSpeech.ssml, "<speak><audio src=\"https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-NEARESTLOCATION-TRAILING.mp3\" /></speak>");
                done();
            });
        });
    });
});

