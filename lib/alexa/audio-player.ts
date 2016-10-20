import {Alexa} from "./alexa";
import {ServiceRequest, RequestType, SessionEndedReason} from "./service-request";
import {EventEmitter} from "events";
import {AudioItem} from "./audio-item";

export enum AudioPlayerActivity {
    BUFFER_UNDERRUN,
    FINISHED,
    IDLE,
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
    private _activity: AudioPlayerActivity = null;
    private _suspended: boolean = false;

    public constructor (public alexa: Alexa) {
        this._activity = AudioPlayerActivity.IDLE;
        this._emitter = new EventEmitter();
    }

    public enqueue(audioItem: AudioItem, playBehavior: string) {
        if (playBehavior === AudioPlayer.PlayBehaviorEnqueue) {
            this._queue.push(audioItem);

        } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceAll) {
            if (this.isPlaying()) {
                this.playbackStopped();
            }

            this._queue = [];
            this._queue.push(audioItem);

        } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceEnqueued) {
            this._queue = [];
            this._queue.push(audioItem);
        }

        if (!this.isPlaying()) {
            this.playNext();
        }
    }

    public activity(): AudioPlayerActivity {
        return this._activity;
    }

    public playNext() {
        if (this._queue.length === 0) {
            return;
        }

        this._playing = this.dequeue();
        // If the URL for AudioItem is http, we throw an error
        if (this._playing.stream.url.startsWith("http:")) {
            this.alexa.sessionEnded(SessionEndedReason.ERROR, {
                type: "INVALID_RESPONSE",
                message: "The URL specified in the Play directive must be HTTPS"
            });
        } else {
            this.playbackStarted();

        }
    }

    public suspend() {
        this._suspended = true;
        this.playbackStopped();
    }

    public suspended(): boolean {
        return this._suspended;
    }

    /**
     * Emulates a certain amount of a track being played back
     * @param offset
     */
    public playbackOffset(offset: number) {
        if (this.isPlaying()) {
            this.playing().stream.offsetInMilliseconds = offset;
        }
    }

    public on(audioPlayerRequest: string, listener: Function) {
        this._emitter.on(audioPlayerRequest, listener);
    }

    public once(audioPlayerRequest: string, listener: Function) {

        this._emitter.once(audioPlayerRequest, listener);
    }

    public resume() {
        this._suspended = false;
        this.playbackStarted();
    }

    public playbackNearlyFinished(callback?: (error: Error, response: any, request: any) => void): void {
        this.audioPlayerRequest(RequestType.AudioPlayerPlaybackNearlyFinished, callback);
    }

    public playbackFinished(callback?: (error: Error, response: any, request: any) => void): void {
        this._activity = AudioPlayerActivity.FINISHED;

        this.audioPlayerRequest(RequestType.AudioPlayerPlaybackFinished, callback);

        // Go the next track, if there is one
        this.playNext();
    }

    public playbackStarted(callback?: (error: Error, response: any, request: any) => void): void {
        this._activity = AudioPlayerActivity.PLAYING;
        this.audioPlayerRequest(RequestType.AudioPlayerPlaybackStarted, callback);
    }

    public playbackStopped(callback?: (error: Error, response: any, request: any) => void): void {
        this._activity = AudioPlayerActivity.STOPPED;
        this.audioPlayerRequest(RequestType.AudioPlayerPlaybackStopped, callback);
    }

    private audioPlayerRequest(requestType: string, callback?: (error: Error, response: any, request: any) => void) {
        const self = this;
        const nowPlaying = this.playing();
        const serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(requestType, nowPlaying.stream.token, nowPlaying.stream.offsetInMilliseconds);
        this.alexa.callSkill(serviceRequest, function (error, response, request) {
            if (callback !== undefined && callback !== null) {
                callback(error, response, request);
            }
            self._emitter.emit(requestType, nowPlaying.clone());
        });
    }

    public directivesReceived(directives: Array<any>): void {
        for (let directive of directives) {
            this.handleDirective(directive);
        }
    }

    private handleDirective(directive: any) {
        // Handle AudioPlayer.Play
        if (directive.type === AudioPlayer.DirectivePlay) {
            let audioItem = new AudioItem(directive.audioItem);
            let playBehavior: string = directive.playBehavior;
            this.enqueue(audioItem, playBehavior);

        } else if (directive.type === AudioPlayer.DirectiveStop) {
            if (this.suspended()) {
                this._suspended = false;
            } else if (this.playing()) {
                this.playbackStopped();
            }
        }
    }

    public isPlaying(): boolean {
        return (this._activity === AudioPlayerActivity.PLAYING);
    }

    private dequeue(): AudioItem {
        const audioItem = this._queue[0];
        this._queue = this._queue.slice(1);
        return audioItem;
    }

    public playing(): AudioItem {
        return this._playing;
    }
}