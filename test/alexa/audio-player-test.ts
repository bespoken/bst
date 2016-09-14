/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {Alexa} from "../../lib/alexa/alexa";
import {AudioPlayer, AudioItem} from "../../lib/alexa/audio-player";
import {AlexaContext} from "../../lib/alexa/alexa-context";
import {RequestCallback} from "request";


describe("AudioPlayer", function() {

    describe("#play", function() {
        it("Enqueues a track, no existing track", function(done) {
            let item = new AudioItem({stream: {
                url: "https://s3.amazonaws.com/xapp-alexa/JPKUnitTest-JPKUnitTest-1645-TAKEMETOWALMART-TRAILING.mp3",
                token: "0",
                expectedPreviousToken: null,
                offsetInMilliseconds: 0
            }});
            let alexa = new MockAlexa(["AudioPlayer.PlaybackStarted", "AudioPlayer.PlaybackNearlyFinished", "AudioPlayer.PlaybackFinished"], [null, null]);
            let audioPlayer = (<any> alexa)._audioPlayer;
            audioPlayer.play(item, AudioPlayer.PlayBehaviorEnqueue);
            audioPlayer.fastForward();
            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                assert(alexa.call(1).request.offsetInMilliseconds > 0);
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
            let audioPlayer = (<any> alexa)._audioPlayer;
            audioPlayer.play(item, AudioPlayer.PlayBehaviorEnqueue);
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
            let audioPlayer = (<any> alexa)._audioPlayer;
            audioPlayer.play(item, AudioPlayer.PlayBehaviorEnqueue);
            alexa.verify(function () {
                assert.equal(alexa.call(0).request.offsetInMilliseconds, 0);
                assert.equal(alexa.call(0).request.token, "0");
                assert.equal(alexa.call(3).request.token, "1");
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
    private done: () => void = null;

    public constructor(private expects?: Array<string>, private responses?: Array<any>) {
        super();
        this["_context"] = new AlexaContext("http://dummy.com");
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

        let self = this;
        setTimeout(function () {
            responseHandler(null, null, response);
            if ((<any> self)._callQueue.length === 0) {
                self.done();
            };
        }, 5);
    }

    public verify(done: () => void) {
        this.done = function () {
            if (this.expects !== undefined && this.expects !== null) {
                for (let i = 0; i < this.expects.length; i++) {
                    let expectation = this.expects[i];
                    if (this.actualCalls.length < (i + 1)) {
                        throw Error("No actual call for expectation: " + expectation);
                    }

                    let actualCall = this.actualCalls[i];
                    if (expectation !== actualCall.request.type) {
                        assert(false, "Actual call: " + actualCall.request.type + " does not match expected: " + expectation);
                    }
                }
            }

            if (this.actualCalls.length > this.expects.length) {
                assert(false, "Actual calls: " + this.actualCalls.length + " Expected: " + this.expects.length);
            }

            done();
        };
    }
}

