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
            {"intent": "NearestLocation"}
        ]
    };

    let sampleUtterancesJSON = {
        "NearestLocation": ["Nearest Location", "Location"]
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
    });
});

