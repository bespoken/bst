/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Alexa} from "../../lib/alexa/alexa";
import {AudioPlayer, AudioItem} from "../../lib/alexa/audio-player";
import {AlexaContext} from "../../lib/alexa/alexa-context";
import {RequestCallback} from "request";


describe("AudioPlayer", function() {

    describe("#launch", function() {
        it("It launches", function (done) {
            let alexa = new MockAlexa(["LaunchRequest"], [null, null]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            alexa.launched();

            alexa.verify(function () {
                assert.equal(alexa.call(0).request.type, "LaunchRequest");
                assert.equal(alexa.call(0).context.AudioPlayer.playerActivity, "STOPPED");
                done();
            });
        });
    });

    describe("#play", function() {
        it("Enqueues a track, no existing track", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(["AudioPlayer.PlaybackStarted",
                "AudioPlayer.PlaybackNearlyFinished",
                "AudioPlayer.PlaybackFinished",
                "IntentRequest"], [null, null]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            audioPlayer.enqueue(item, AudioPlayer.PlayBehaviorEnqueue);
            audioPlayer.finish();
            alexa.intended("AMAZON.LoopOffIntent", null);

            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                assert(alexa.call(1).request.offsetInMilliseconds > 0);
                assert.equal(alexa.call(3).context.AudioPlayer.playerActivity, "FINISHED");
                done();
            });
        });

        it("Enqueues a track, existing track is playing", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(
                ["AudioPlayer.PlaybackStarted", "AudioPlayer.PlaybackNearlyFinished", "AudioPlayer.PlaybackFinished", "AudioPlayer.PlaybackStarted",  "AudioPlayer.PlaybackNearlyFinished"],
                [null, directiveResponse("AudioPlayer.Play", "ENQUEUE", "1"), null, null, null]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            audioPlayer.enqueue(item, AudioPlayer.PlayBehaviorEnqueue);
            audioPlayer.fastForward();
            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                done();
            });
        });

        it("Enqueues a track, replaces existing track", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(
                ["AudioPlayer.PlaybackStarted", "AudioPlayer.PlaybackNearlyFinished", "AudioPlayer.PlaybackStopped", "AudioPlayer.PlaybackStarted",  "AudioPlayer.PlaybackNearlyFinished"],
                [null, directiveResponse("AudioPlayer.Play", "REPLACE_ALL", "1"), null, null, null]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            audioPlayer.enqueue(item, AudioPlayer.PlayBehaviorEnqueue);
            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                assert.equal(alexa.call(3).request.token, "1");
                done();
            });
        });

        it("Enqueues a track, replaces queue", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(
                ["AudioPlayer.PlaybackStarted",
                    "AudioPlayer.PlaybackNearlyFinished",
                    "AudioPlayer.PlaybackFinished",
                    "AudioPlayer.PlaybackStarted",
                    "AudioPlayer.PlaybackNearlyFinished"],
                [directiveResponse("AudioPlayer.Play", "ENQUEUE", "1"), directiveResponse("AudioPlayer.Play", "REPLACE_ENQUEUED", "2"), null, null, null]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            audioPlayer.enqueue(item, AudioPlayer.PlayBehaviorEnqueue);
            let firstResponse = true;
            alexa.onSkillResponse(function(skillRequestJSON, skillResponseJSON) {
                if (firstResponse && skillRequestJSON.request.type === "AudioPlayer.PlaybackNearlyFinished") {
                    audioPlayer.fastForward();
                    firstResponse = false;
                }
            });

            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                assert.equal(alexa.call(3).request.token, "2");
                done();
            });
        });
    });

    describe("#Suspends", function() {
        it("Suspends and resumes for an intent", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(["AudioPlayer.PlaybackStarted",
                    "AudioPlayer.PlaybackNearlyFinished",
                    "AudioPlayer.PlaybackStopped",
                    "IntentRequest",
                    "AudioPlayer.PlaybackStarted",
                    "AudioPlayer.PlaybackNearlyFinished"],
                [null, null, null, null]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            audioPlayer.enqueue(item, AudioPlayer.PlayBehaviorEnqueue);
            setTimeout(function () {
                alexa.intended("AMAZON.LoopOffIntent", null);
            }, 5);

            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                let stopOffset = alexa.call(2).request.offsetInMilliseconds;
                assert.equal(alexa.call(3).context.AudioPlayer.token, "0");
                assert.equal(alexa.call(3).context.AudioPlayer.offsetInMilliseconds, stopOffset);
                assert.equal(alexa.call(3).context.AudioPlayer.playerActivity, "STOPPED");
                assert.equal(alexa.call(4).request.token, "0");
                assert.equal(alexa.call(4).request.offsetInMilliseconds, stopOffset);
                done();
            });
        });

        it("Suspends and does not resume", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(["AudioPlayer.PlaybackStarted",
                    "AudioPlayer.PlaybackNearlyFinished",
                    "AudioPlayer.PlaybackStopped",
                    "IntentRequest"],
                [null, null, null, directiveResponse("AudioPlayer.Stop", null, "0")]);
            let audioPlayer = new AudioPlayer(alexa);
            alexa["_context"]["_audioPlayer"] = audioPlayer;
            audioPlayer.enqueue(item, AudioPlayer.PlayBehaviorEnqueue);
            alexa.intended("AMAZON.PauseIntent", null);

            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                done();
            });
        });
    });
});

function directiveResponse (dircectiveType: string, playBehavior: string, token: string) {
    return {
        response: {
            shouldEndSession: true,
            directives: [
                {
                    type: dircectiveType,
                    playBehavior: playBehavior,
                    audioItem: {
                        stream: {
                            url: "https://feeds.soundcloud.com/stream/273105224-amazon-web-services-306355661-aws-podcast-episode-138.mp3",
                            token: token,
                            expectedPreviousToken: <any> null,
                            offsetInMilliseconds: 0
                        }
                    }
                }
            ]
        }
    };
}

class MockAlexa extends Alexa {
    private actualCalls: Array<any> = [];

    public constructor(private expects?: Array<string>, private responses?: Array<any>) {
        super();
        this["_context"] = new AlexaContext("http://dummy.com", null);
    }

    public call(index: number) {
        return this.actualCalls[index];
    }

    protected post(options: any, responseHandler: RequestCallback) {
        this.actualCalls.push(options.json);
        let response: any = {
            response: {
                shouldEndSession: true
            }
        };

        let index = this.actualCalls.length - 1;
        if (index < this.responses.length && this.responses[index] !== null) {
            response = this.responses[index];
        }

        setTimeout(function () {
            responseHandler(null, null, response);
        }, 5);
    }

    public verify(done: () => void) {
        let self = this;
        setTimeout(function () {
            if (self.expects !== undefined && self.expects !== null) {
                for (let i = 0; i < self.expects.length; i++) {
                    let expectation = self.expects[i];
                    if (self.actualCalls.length < (i + 1)) {
                        throw Error("No actual call for expectation: " + expectation);
                    }

                    let actualCall = self.actualCalls[i];
                    if (expectation !== actualCall.request.type) {
                        assert(false, "Actual call: " + actualCall.request.type + " does not match expected: " + expectation);
                    }
                }
            }

            if (self.actualCalls.length > self.expects.length) {
                assert(false, "Actual calls: " + self.actualCalls.length + " Expected: " + self.expects.length);
            }

            done();
        }, 500);
    }
}

