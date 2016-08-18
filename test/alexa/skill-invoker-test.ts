/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {ServiceRequest} from "../../lib/alexa/service-request";
import {InteractionModel} from "../../lib/alexa/interaction-model";
import {SampleUtterances} from "../../lib/alexa/sample-utterances";
import {SkillInvoker} from "../../lib/alexa/skill-invoker";


describe("SkillInvoker", function() {
    // The intent schema we will use in these tests
    let intentSchemaJSON = {
        "intents": [
            {"intent": "NearestLocation"},
            {"intent": "AnotherIntent"}
        ]
    };

    let sampleUtterancesJSON = {
        "NearestLocation": ["Nearest Location", "Location"],
        "NoMatchingIntent": ["No Matching"]
    };

    let model: InteractionModel = new InteractionModel(
        new IntentSchema(intentSchemaJSON),
        SampleUtterances.fromJSON(sampleUtterancesJSON));

    describe("#say", function() {
        it("Returns payload", function(done) {
            this.timeout(5000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            let invoker = new SkillInvoker(skillURL, model, "MyApp");
            invoker.say("Nearest Location", function (data: any) {
                assert(data.response.outputSpeech.ssml !== null);
                assert.equal(data.response.outputSpeech.ssml, "<speak><audio src=\"https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-NEARESTLOCATION-TRAILING.mp3\" /></speak>");
                done();
            });
        });

        it("Handles error on bad URL", function(done) {
            this.timeout(5000);
            let skillURL = "https://alexa.xappmedia.xyz/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            let invoker = new SkillInvoker(skillURL, model, "MyApp");
            invoker.say("Nearest Location", function (data: any, error: string) {
                assert(error);
                assert.equal(error, "getaddrinfo ENOTFOUND alexa.xappmedia.xyz alexa.xappmedia.xyz:443");
                done();
            });
        });

        it("Handles error on bad Intent", function(done) {
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            let invoker = new SkillInvoker(skillURL, model, "MyApp");
            invoker.say("No Matching", function (data: any, error: string) {
                assert(error);
                assert.equal(error, "Interaction model has no intent named: NoMatchingIntent");
                done();
            });
        });

        it("Handles default on bad Phrase", function(done) {
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            let invoker = new SkillInvoker(skillURL, model, "MyApp");
            invoker.say("NotMatching", function (data: any, error: string) {
                assert.equal(data.response.outputSpeech.ssml, "<speak><audio src=\"https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-NEARESTLOCATION-TRAILING.mp3\" /></speak>");
                done();
            });
        });
    });
});

