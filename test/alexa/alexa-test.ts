import * as assert from "assert";
import {IntentSchema} from "../../lib/alexa/intent-schema";
import {InteractionModel} from "../../lib/alexa/interaction-model";
import {SampleUtterances} from "../../lib/alexa/sample-utterances";
import {Alexa} from "../../lib/alexa/alexa";
import {RequestCallback} from "request";


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

    let alexa: Alexa = null;
    beforeEach(function () {
        alexa = new Alexa();
    });

    describe("#spoken()", function() {
        it("Returns payload", function(done) {
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";

            (<any> alexa).post = function(options: any, responseHandler: RequestCallback) {
                responseHandler(null, null, {
                    response: {
                        shouldEndSession: true,
                        outputSpeech: {
                            ssml: "<speak><audio src=\"https://audio.com/audio.mp3\" /></speak>"
                        }
                    }
                });
            };

            alexa.startSession(skillURL, model, false).spoken("Nearest Location", function (error: any, response: any, request: any) {
                assert(request);
                assert(response.response.outputSpeech.ssml !== null);
                assert.equal(response.response.outputSpeech.ssml, "<speak><audio src=\"https://audio.com/audio.mp3\" /></speak>");
                done();
            });
        });

        it("Handle With Slot", function(done) {
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            (<any> alexa).post = function(options: any, responseHandler: RequestCallback) {
                responseHandler(null, null, {
                    response: {
                        shouldEndSession: true,
                    }
                });
            };

            alexa.startSession(skillURL, model, false).spoken("Take Me To Walmart {A}", function (error: any, response: any) {
                assert(response.response.shouldEndSession);
                done();
            });
        });

        it("Handles error on bad URL", function(done) {
            this.timeout(5000);
            let skillURL = "https://alexa.xappmedia.xyz/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("Nearest Location", function (error: any){
                assert(error);
                assert.equal(error.message, "getaddrinfo ENOTFOUND alexa.xappmedia.xyz alexa.xappmedia.xyz:443");
                done();
            });
        });

        it("Handles error on bad Intent", function(done) {
            this.timeout(10000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("No Matching", function (error: any) {
                assert(error);
                assert.equal(error.message, "Interaction model has no intentName named: NoMatchingIntent");
                done();
            });
        });

        it("Handles default on bad Phrase", function(done) {
            this.timeout(10000);
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).spoken("NotMatching", function (error: any, response: any, request: any) {
                assert.equal(request.request.intent.name, "NearestLocation");
                done();
            });
        });

        it("Handles end session", function(done) {
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            (<any> alexa).post = function(options: any, responseHandler: RequestCallback) {
                responseHandler(null, null, {
                    response: {
                        shouldEndSession: true
                    }
                });
            };
            alexa.startSession(skillURL, model, false);
            alexa.spoken("Nearest Location", function () {
                assert(!alexa.context().activeSession());
                done();
            });
        });

        it("Handles session attributes", function(done) {
            let skillURL = "https://alexa.xappmedia.com/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";

            let count = 0;
            (<any> alexa).post = function(options: any, responseHandler: RequestCallback) {
                count++;
                let shouldEndSession = false;
                if (count === 2) {
                    shouldEndSession = true;
                }
                responseHandler(null, null, {
                    response: {
                        shouldEndSession: shouldEndSession
                    },
                    sessionAttributes: {
                        attribute1: "Test"
                    }
                });

                // On the second call, the session attributes should be in the request that came through on the previous response
                if (count === 2) {
                    assert.equal(options.json.session.attributes.attribute1, "Test");
                }

                if (count === 3) {
                    assert(!options.json.session.attributes.attribute1);
                }
            };
            alexa.startSession(skillURL, model, false);
            alexa.spoken("Nearest Location");
            alexa.spoken("Nearest Location");
            alexa.spoken("Nearest Location", function () {
                done();
            });

        });
    });

    describe("#intended()", function () {
        it("Handles error on bad URL", function(done) {
            let skillURL = "https://alexa.xappmedia.xyz/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            alexa.startSession(skillURL, model, false).intended("NearestLocation", null, function (error: any) {
                assert(error);
                assert.equal(error.message, "getaddrinfo ENOTFOUND alexa.xappmedia.xyz alexa.xappmedia.xyz:443");
                done();
            });
        });
    });

    describe("#shutdown()", function () {
        it("Shuts down async correctly", function(done) {
            let skillURL = "https://alexa.xappmedia.xyz/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            (<any> alexa).post = function(options: any, responseHandler: RequestCallback) {
                setTimeout(function () {
                    responseHandler(null, null, {
                        response: {
                            shouldEndSession: true
                        }
                    });
                }, 1);
            };
            alexa.startSession(skillURL, model, false);
            alexa.spoken("NotMatching");
            alexa.intended("NearestLocation", null);
            alexa.stop(function () {
                done();
            });
        });

        it("Shuts down immediately", function(done) {
            let skillURL = "https://alexa.xappmedia.xyz/xapp?tag=JPKUnitTest&apiKey=XappMediaApiKey&appKey=DefaultApp";
            (<any> alexa).post = function(options: any, responseHandler: RequestCallback) {
                responseHandler(null, null, {
                    response: {
                        shouldEndSession: true
                    }
                });
            };
            alexa.startSession(skillURL, model, false);
            alexa.spoken("NotMatching");
            alexa.intended("NearestLocation", null);
            alexa.stop(function () {
                done();
            });
        });
    });
});

