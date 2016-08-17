/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {ServiceRequest} from "../../lib/alexa/service-request";
import {InteractionModel} from "../../lib/alexa/interaction-model";


describe("ServiceRequest", function() {
    // The intent schema we will use in these tests
    let intentSchemaJSON = {
        "intents": [
            {"intent": "Test"},
            {"intent": "Another Test"},
            {"intent": "AMAZON.HelpIntent"},
            {"intent": "WithSlot",
                "slots": [
                    {"name": "SlotName", "type": "SLOT_TYPE"}
                ]
            },
            {"intent": "WithMultiSlot",
                "slots": [
                    {"name": "SlotName", "type": "SLOT_TYPE"},
                    {"name": "SlotName2", "type": "SLOT_TYPE2"}
                ]
            }
        ]
    };

    let model: InteractionModel = new InteractionModel(new IntentSchema(intentSchemaJSON), null);

    describe("#createIntentRequest", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(model, "MyApp");

            let request: any = requester.intentRequest("Test").toJSON();
            assert.equal(request.session.application.applicationId, "MyApp");
            assert.equal(request.session.new, true);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "IntentRequest");
            assert.equal(request.request.intent.name, "Test");
            assert.equal(request.request.timestamp.length, 20);

            let request2: any = requester.intentRequest("Test").toJSON();
            assert.equal(request2.session.new, false);
            assert.equal(request2.session.sessionId, request.session.sessionId);
            done();
        });
    });
});
