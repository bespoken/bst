import {Alexa} from "./alexa";
import {ServiceRequest} from "./service-request";

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
    private _queue: Array<AudioItem> = [];
    private _state: AudioPlayerState = null;

    public constructor (public alexa: Alexa) {
        this._state = AudioPlayerState.PlaybackStopped;
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

    private playbackStarted(offset: number): void {
        this._state = AudioPlayerState.PlaybackStarted;
        let audioPlayerRequest = new ServiceRequest(this.alexa.context()).playbackStarted(this._playing.token, offset).toJSON();

        this.alexa.callSkill(audioPlayerRequest, function (request: any, response: any, error?: string) {
            console.log("Response Received: " + response);
        });
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

            if (playBehavior === AudioPlayer.PlayBehaviorEnqueue) {
                this.playOrEnqueue(audioItem);

            } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceAll) {
                this._queue = [];
                this._playing = null;
                this.playOrEnqueue(audioItem);

            } else if (playBehavior === AudioPlayer.PlayBehaviorReplaceEnqueued) {
                this._queue = [];
                this.playOrEnqueue(audioItem);
            }
        }
    }

    private playOrEnqueue(audioItem: AudioItem) {
        let self = this;
        if (this._playing !== null) {
            this._queue.push(audioItem);
        } else {
            this._playing = audioItem;
            this.playbackStarted(0);

            // If this is a new track, we send a PlaybackNearlyFinished after a brief pause
            let offset = 50;
            setTimeout(function () {
                self.playbackNearlyFinished(offset);
            }, offset);

        }
    }

    private playing(): boolean {
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