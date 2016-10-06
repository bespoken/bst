/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {ServiceRequest} from "../../lib/alexa/service-request";
import {InteractionModel} from "../../lib/alexa/interaction-model";
import {SessionEndedReason} from "../../lib/alexa/service-request";
import {AlexaContext} from "../../lib/alexa/alexa-context";
import {RequestType} from "../../lib/alexa/service-request";


describe("ServiceRequest", function() {
    // The intentName schema we will use in these tests
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
    let context = new AlexaContext("https://skill.com/skillPath", model, null, "MyApp");
    context.newSession();

    describe("#intentRequest()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.intentRequest("Test").toJSON();
            assert.equal(request.session.application.applicationId, "MyApp");
            assert.equal(request.session.new, true);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "IntentRequest");
            assert.equal(request.request.intent.name, "Test");
            assert.equal(request.request.timestamp.length, 20);
            assert(request.context.System.application.applicationId);
            assert(request.context.System.device.supportedInterfaces.AudioPlayer);


            done();
        });

        it("Handles error", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            try {
                requester.intentRequest("Test2").toJSON();
            } catch (e) {
                assert(e.message, "Interaction model has no intentName named: Test2");
                done();
            }

        });

        it("With Slot", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.intentRequest("WithSlot").withSlot("SlotName", "Value").toJSON();
            assert.equal(request.session.application.applicationId, "MyApp");
            assert.equal(request.session.new, true);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "IntentRequest");
            assert.equal(request.request.intent.slots["SlotName"].name, "SlotName");
            assert.equal(request.request.intent.slots["SlotName"].value, "Value");
            assert.equal(request.request.timestamp.length, 20);
            done();

        });

        it("With Slot, Values Unspecified", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.intentRequest("WithSlot").toJSON();
            // Make sure there is a spot for the slot but not value
            assert.equal(request.request.intent.slots["SlotName"].name, "SlotName");
            assert(request.request.intent.slots["SlotName"].value === undefined);
            assert.equal(request.request.timestamp.length, 20);
            done();

        });
    });

    describe("#launchRequest()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.launchRequest().toJSON();
            assert.equal(request.session.application.applicationId, "MyApp");
            assert.equal(request.session.new, true);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "LaunchRequest");
            assert.equal(request.request.timestamp.length, 20);

            done();
        });
    });

    describe("#sessionEndedRequest()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.sessionEndedRequest(SessionEndedReason.ERROR).toJSON();
            assert.equal(request.session.application.applicationId, "MyApp");
            assert.equal(request.session.new, true);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "SessionEndedRequest");
            assert.equal(request.request.reason, "ERROR");
            assert.equal(request.request.timestamp.length, 20);

            done();
        });
    });

    describe("#playbackStarted()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.audioPlayerRequest(RequestType.AudioPlayerPlaybackStarted, "0", 20).toJSON();
            assert.equal(request.session, undefined);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "AudioPlayer.PlaybackStarted");
            assert.equal(request.request.timestamp.length, 20);
            assert(request.context.System.application.applicationId);

            done();
        });
    });

    describe("#playbackNearlyFinished()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.audioPlayerRequest(RequestType.AudioPlayerPlaybackNearlyFinished, "1", 50).toJSON();
            assert.equal(request.session, undefined);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "AudioPlayer.PlaybackNearlyFinished");
            assert.equal(request.request.timestamp.length, 20);
            assert.equal(request.request.offsetInMilliseconds, 50);
            assert.equal(request.request.token, "1");

            assert(request.context.System.application.applicationId);

            done();
        });
    });
});
