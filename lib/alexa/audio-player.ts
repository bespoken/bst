import {Alexa} from "./alexa";
import {EventEmitter} from "events";
import {ServiceRequest} from "./service-request";

export enum AudioPlayerState {
    PLAYING,
    PAUSED,
    STOPPED
}

/**
 * Emulates the behavior of the audio player
 */
export class AudioPlayer {
    public static DirectivePlay = "AudioPlayer.Play";
    public static DirectiveStop = "AudioPlayer.Stop";
    public static DirectiveClearQueue = "AudioPlayer.ClearQueue";

    public static PlayBehaviorReplaceAll = "REPLACE_ALL";
    public static PlayBehaviorEnqueue = "ENQUEUE";
    public static PlayBehaviorReplaceEnqueued = "REPLACE_ENQUEUED";

    private _emitter: EventEmitter = null;
    private _playing: AudioItem = null;
    private _queue: Array<AudioItem> = [];
    private _state: AudioPlayerState = null;

    public constructor (public alexa: Alexa) {
        this._emitter = new EventEmitter();
        this._state = AudioPlayerState.STOPPED;
    }

    public queue(): Array<AudioItem> {
        return this._queue;
    }

    private playbackNearlyFinished(offset: number): void {
        let audioPlayerRequest = new ServiceRequest(this.alexa.context()).playbackNearlyFinished(this._playing.token, offset).toJSON();
        this.alexa.callSkill(audioPlayerRequest, function (request: any, response: any, error?: string) {
            console.log("Response Received: " + response);
        });
    }

    private playbackStarted(): void {
        this._state = AudioPlayerState.PLAYING;

        this.alexa.callSkill(new ServiceRequest(this.alexa.context()).playbackStarted().toJSON(), function (request: any, response: any, error?: string) {
            console.log("Response Received: " + response);
        });
    }

    public directivesReceived(directives: Array<any>): void {
        for (let directive of directives) {
            this.handleDirective(directive);
        }
    }

    private handleDirective(directive: any) {
        let self = this;
        // Handle AudioPlayer.Play
        if (directive.type === AudioPlayer.DirectivePlay) {
            let audioItem = new AudioItem(directive.audioItem);

            let playbackBehavior: string = directive.playbackBehavior;
            let newTrack = false;

            if (playbackBehavior === AudioPlayer.PlayBehaviorEnqueue) {
                this._queue.push(audioItem);
            } else if (playbackBehavior === AudioPlayer.PlayBehaviorReplaceAll) {
                this._queue = [];
                this._playing = audioItem;
                newTrack = true;
            } else if (playbackBehavior === AudioPlayer.PlayBehaviorReplaceEnqueued) {
                this._queue = [];
                this._queue.push(audioItem);

                if (this._playing === null) {
                    this._playing = audioItem;
                    newTrack = true;
                }
            }

            if (this._state === AudioPlayerState.STOPPED || this._state === AudioPlayerState.PAUSED) {
                // When we start playing, immediately call PlaybackStarted
                this.playbackStarted();
                newTrack = true;
            }

            // If this is a new track, we send a PlaybackNearlyFinished after a brief pause
            if (newTrack) {
                let offset = 50;
                setTimeout(function () {
                    self.playbackNearlyFinished(offset);
                }, offset);
            }
        }
    }
}

/**
 *
 */
export class AudioItem {
    public url: string = null;
    public token: string = null;
    public expectedPreviousToken: string = null;
    public offsetInMilliseconds: number;

    public constructor (public json: any) {
        this.url = json.stream.url;
        this.token = json.stream.token;
        this.expectedPreviousToken = json.stream.expectedPreviousToken;
        this.offsetInMilliseconds = json.stream.offsetInMilliseconds;
    }
}