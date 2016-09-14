import {Alexa} from "./alexa";
import {ServiceRequest, RequestType} from "./service-request";

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

    private _playing: AudioItem = null;
    private _playingStartTime: number = 0;
    private _playingStopTime: number = 0;
    private _queue: Array<AudioItem> = [];
    private _state: AudioPlayerState = null;
    private _suspended: boolean = false;

    public constructor (public alexa: Alexa) {
        this._state = AudioPlayerState.PlaybackStopped;
    }

    public play(audioItem: AudioItem, playBehavior: string) {
        if (playBehavior === AudioPlayer.PlayBehaviorEnqueue) {
            this.enqueue(audioItem);

        } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceAll) {
            this.stop();
            this.clearQueue();
            this.enqueue(audioItem);

        } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceEnqueued) {
            this.clearQueue();
            this.enqueue(audioItem);
        }
    }

    public stop() {

        this._playingStopTime = new Date().getTime();
        let offset = this._playingStopTime - this._playingStartTime;
        this.playbackStopped(offset);
    }

    public suspend() {
        this._suspended = true;
        this.stop();
    }

    public suspended(): boolean {
        return this._suspended;
    }

    /**
     * For testing purposes - jumps to the end of audio
     * Simulates audio being completed - not the same as AMAZON.NextIntent
     */
    public fastForward(): void {
        // We make up an offset - we do not know how long the audio file is
        this.playbackFinished(1000);
        if (this.dequeue() !== null) {
            this.playbackStarted(0);
        }
    }

    public resume() {
        this._suspended = false;
        let offset = this._playingStopTime - this._playingStartTime;
        this._playingStopTime = 0;
        this.playbackStarted(offset);
    }

    private playbackNearlyFinished(offset: number): void {
        let serviceRequest = new ServiceRequest(this.alexa.context())
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackNearlyFinished, this._playing.token, offset);
        this.alexa.callSkill(serviceRequest.toJSON());
    }

    private playbackFinished(offset: number): void {
        let serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackFinished, this._playing.token, offset);
        this.alexa.callSkill(serviceRequest.toJSON());
    }

    private playbackStarted(offset: number): void {
        this._state = AudioPlayerState.PlaybackStarted;
        this._playingStartTime = new Date().getTime();

        let serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackStarted, this._playing.token, offset);
        this.alexa.callSkill(serviceRequest.toJSON());
    }

    private playbackStopped(offset: number): void {
        let stoppedItem = this._playing;
        this._state = AudioPlayerState.PlaybackStopped;
        this._playing = null;

        let serviceRequest = new ServiceRequest(this.alexa.context());
        serviceRequest.audioPlayerRequest(RequestType.AudioPlayerPlaybackStopped, stoppedItem.token, offset);
        this.alexa.callSkill(serviceRequest.toJSON());
    }

    public directivesReceived(request: any, directives: Array<any>): void {
        for (let directive of directives) {
            this.handleDirective(request, directive);
        }
    }

    private handleDirective(request: any, directive: any) {
        // Handle AudioPlayer.Play
        if (directive.type === AudioPlayer.DirectivePlay) {
            let audioItem = new AudioItem(directive.audioItem);
            let playBehavior: string = directive.playBehavior;
            this.play(audioItem, playBehavior);

        } else if (directive.type === AudioPlayer.DirectiveStop) {
            this._suspended = false;
            if (this.playing()) {
                this.stop();
            }
        }
    }

    public queue(): Array<AudioItem> {
        return this._queue;
    }

    public clearQueue(): void {
        this._queue = [];
    }

    private enqueue(audioItem: AudioItem) {
        if (this._playing !== null) {
            this._queue.push(audioItem);
        } else {
            this._playing = audioItem;
            this.playbackStarted(0);

            // If this is a new track, we send a PlaybackNearlyFinished after a brief pause
            this.playbackNearlyFinished(new Date().getTime() - this._playingStartTime);
        }
    }

    private dequeue(): AudioItem {
        this._playing = null;
        if (this._queue.length > 0) {
            this._playing = this._queue[0];
            this._queue = this._queue.slice(1);
        }

        return this._playing;
    }

    public playing(): boolean {
        return (this._state === AudioPlayerState.PlaybackStarted || this._state === AudioPlayerState.PlaybackNearlyFinished);
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