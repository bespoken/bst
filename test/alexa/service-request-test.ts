import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {ServiceRequest} from "../../lib/alexa/service-request";
import {InteractionModel} from "../../lib/alexa/interaction-model";
import {SessionEndedReason} from "../../lib/alexa/service-request";
import {AlexaContext} from "../../lib/alexa/alexa-context";
import {RequestType} from "../../lib/alexa/service-request";
import {AudioItem} from "../../lib/alexa/audio-item";
import {AudioPlayerActivity} from "../../lib/alexa/audio-player";


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

    let mockAudioPlayer: any = {
        activity: function () {
            return AudioPlayerActivity.IDLE;
        },

        playing: function () {
            return new AudioItem({
                stream: {
                    url: "https://d2mxb5cuq6ityb.cloudfront.net/Brand_Haiku-Three-8a264581-50af-4fc5-b509-4737dc34d26e.m4a",
                    token: "2",
                    expectedPreviousToken: "1",
                    offsetInMilliseconds: 100
                }
            });
        }
    };
    let model: InteractionModel = new InteractionModel(new IntentSchema(intentSchemaJSON), null);
    let context = new AlexaContext("https://skill.com/skillPath", model, mockAudioPlayer, "MyApp");
    context.newSession();

    describe("#intentRequest()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.intentRequest("Test").toJSON();
            assert.equal(request.session.application.applicationId, "MyApp");
            assert.equal(request.session.new, true);
            assert.equal(request.version, "1.0");
            assert(request.request.requestId.startsWith("amzn1.echo-api.request"));
            assert.equal(request.request.type, "IntentRequest");
            assert.equal(request.request.intent.name, "Test");
            assert.equal(request.request.timestamp.length, 20);
            assert(request.context.System.application.applicationId);
            assert(request.context.System.device.supportedInterfaces.AudioPlayer);
            assert.equal(request.context.AudioPlayer.playerActivity, "IDLE");
            assert(!request.context.System.user.accessToken);
            assert(!request.session.user.accessToken);
            assert(!request.context.AudioPlayer.token);
            assert(!request.context.AudioPlayer.offsetInMilliseconds);

            done();
        });

        it("Correctly parses intent with accessToken", function(done) {
            let linkedContext = new AlexaContext("https://skill.com/skillPath", model, mockAudioPlayer, "MyApp");
            linkedContext.setAccessToken("JPK");
            linkedContext.setUserID("CustomUserId");
            linkedContext.newSession();
            linkedContext.session().setID("CustomSessionId");
            let requester: ServiceRequest = new ServiceRequest(linkedContext);
            let request: any = requester.intentRequest("Test").toJSON();
            assert(request.context.System.user.accessToken);
            assert(request.session.user.accessToken);
            assert.equal(request.session.user.accessToken, "JPK");
            assert.equal(request.session.user.userId, "CustomUserId");
            assert.equal(request.session.sessionId, "CustomSessionId");
            done();
        });

        it("Correctly parses intents with audio player stuff", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);
            mockAudioPlayer.activity = function () {
                return AudioPlayerActivity.STOPPED;
            };

            let request: any = requester.intentRequest("Test").toJSON();
            assert.equal(request.context.AudioPlayer.playerActivity, "STOPPED");
            assert.equal(request.context.AudioPlayer.token, "2");
            assert.equal(request.context.AudioPlayer.offsetInMilliseconds, 100);

            done();
        });

        it("Correctly parses intent without AudioPlayer", function(done) {
            context["_audioPlayer"] = null;
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
            assert(!request.context.AudioPlayer);
            assert(request.context.System.user.userId.startsWith("amzn1.ask.account."));

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

    describe("#playbackFinished()", function() {
        it("Correctly parses intents", function(done) {
            let requester: ServiceRequest = new ServiceRequest(context);

            let request: any = requester.audioPlayerRequest(RequestType.AudioPlayerPlaybackFinished, "1", 50).toJSON();
            assert.equal(request.session, undefined);
            assert.equal(request.version, "1.0");
            assert.equal(request.request.type, "AudioPlayer.PlaybackFinished");
            assert.equal(request.request.timestamp.length, 20);
            assert.equal(request.request.offsetInMilliseconds, 50);
            assert.equal(request.request.token, "1");

            assert(!request.context.AudioPlayer);
            assert(request.context.System.application.applicationId);

            done();
        });
    });
});
