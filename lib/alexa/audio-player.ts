import {Alexa} from "./alexa";
import {ServiceRequest, RequestType, SessionEndedReason} from "./service-request";
import {EventEmitter} from "events";
import {AudioItem} from "./audio-item";

export enum AudioPlayerState {
    PlaybackError,
    PlaybackFinished,
    PlaybackNearlyFinished,
    PlaybackStarted,
    PlaybackStopped
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
    private _playingOffset: number = 0;
    private _queue: Array<AudioItem> = [];
    private _state: AudioPlayerState = null;
    private _suspended: boolean = false;

    public constructor (public alexa: Alexa) {
        this._state = AudioPlayerState.PlaybackStopped;
        this._emitter = new EventEmitter();
    }

    public enqueue(audioItem: AudioItem, playBehavior: string) {
        if (playBehavior === AudioPlayer.PlayBehaviorEnqueue) {
            this.queueAdd(audioItem);

        } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceAll) {
            if (this.isPlaying()) {
                this.playbackStopped();
            }
            this.queueClear();
            this.queueAdd(audioItem);

        } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceEnqueued) {
            this.queueReplace();
            this.queueAdd(audioItem);
        }
    }

    public offsetInMilliseconds(): number {
        return this._playingOffset;
    }

    public state() {
        return this._state;
    }

    public token(): string {
        let token: string = null;
        if (this.playing() !== null) {
            token = this.playing().token;
        }
        return token;
    }

    public playNext() {
        if (this._queue.length === 0) {
            return;
        }

        this._playingOffset = 0;

        let audioItem = this.playing();
        // If the URL for AudioItem is http, we throw an error
        if (audioItem.url.startsWith("http:")) {
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
        this._playingOffset = offset;
    }

    public on(audioPlayerState: AudioPlayerState, listener: Function) {
        this._emitter.on(AudioPlayerState[audioPlayerState], listener);
    }

    public resume() {
        this._suspended = false;
        this.playbackStarted();
    }

    public playbackNearlyFinished(): void {
        let serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackNearlyFinished, this.playing().token, this._playingOffset);
        this.alexa.callSkill(serviceRequest);
    }

    public playbackFinished(): void {
        this._state = AudioPlayerState.PlaybackFinished;
        let serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackFinished, this.playing().token, this._playingOffset);
        this.alexa.callSkill(serviceRequest);

        // Go the next track, if there is one
        this.queueSlice();
        this.playNext();
    }

    public playbackStarted(): void {
        const self = this;
        this._state = AudioPlayerState.PlaybackStarted;

        const currentlyPlaying = this.playing();
        const serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackStarted, this.playing().token, this._playingOffset);
        this.alexa.callSkill(serviceRequest, function () {
            self._emitter.emit(AudioPlayerState[AudioPlayerState.PlaybackStarted], currentlyPlaying.json);
        });
    }

    public playbackStopped(): void {
        const self = this;
        this._state = AudioPlayerState.PlaybackStopped;

        const currentlyPlaying = this.playing();
        const serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackStopped, this.playing().token, this._playingOffset);
        this.alexa.callSkill(serviceRequest, function () {
            self._emitter.emit(AudioPlayerState[AudioPlayerState.PlaybackStopped], currentlyPlaying.json);
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
        return (this._state === AudioPlayerState.PlaybackStarted || this._state === AudioPlayerState.PlaybackNearlyFinished);
    }

    private queueAdd(audioItem: AudioItem): void {
        this._queue.push(audioItem);
        if (this._queue.length === 1) {
            this.playNext();
        }
    }

    private queueClear(): void {
        this._queue = [];
    }

    private queueReplace(): void {
        this._queue = [this._queue[0]];
    }

    private queueSlice(): void {
        this._queue = this._queue.slice(1);
    }

    private playing(): AudioItem {
        if (this._queue.length === 0) {
            return null;
        }
        return this._queue[0];
    }
}