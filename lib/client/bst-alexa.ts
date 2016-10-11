import {InteractionModel} from "../alexa/interaction-model";
import {Alexa, AlexaEvent} from "../alexa/alexa";
import {Global} from "../core/global";
import {SessionEndedReason} from "../alexa/service-request";

export class BSTAlexaEvents {
    /**
     * Fired when an {@link AudioItem} finishes playing. Means that it played to completion (as opposed to being stopped)
     *
     * Payload is an {@link AudioItem}.
     */
    public static AudioPlayerPlaybackFinished = "AudioPlayer.PlaybackFinished";

    /**
     * Fired when an {@link AudioItem} has nearly finished. An opportunity to queue the next track.
     *
     * Payload is an {@link AudioItem}.
     */
    public static AudioPlayerPlaybackNearlyFinished = "AudioPlayer.PlaybackNearlyFinished";

    /**
     * Fired when an {@link AudioItem} begins playing.
     *
     * Payload is an {@link AudioItem}.
     */
    public static AudioPlayerPlaybackStarted = "AudioPlayer.PlaybackStarted";

    /**
     * Fired when an {@link AudioItem} has stopped playing.
     *
     * Payload is an {@link AudioItem}.
     */
    public static AudioPlayerPlaybackStopped = "AudioPlayer.PlaybackStopped";

    /**
     * Fired when a response is received from the Alexa Skill.
     *
     * Parameters are the raw response JSON and the request JSON that triggered it.
     */
    public static Response = "response";
}

/**
 * Programmatic interface for interacting with the Bespoken Tools Alexa emulator.
 *
 * Overview on usage can be found [here](../index.html). NodeJS tutorial [here](../../tutorials/tutorial_bst_emulator_nodejs)
 *
 */
export class BSTAlexa {
    private static AudioPlayerEvents: Array<string> = [BSTAlexaEvents.AudioPlayerPlaybackFinished,
        BSTAlexaEvents.AudioPlayerPlaybackNearlyFinished,
        BSTAlexaEvents.AudioPlayerPlaybackStarted,
        BSTAlexaEvents.AudioPlayerPlaybackStopped];

    public static DefaultIntentSchemaLocation = "speechAssets/IntentSchema.json";
    public static DefaultSampleUtterancesLocation = "speechAssets/SampleUtterances.txt";
    private _alexa: Alexa = null;

    /**
     * Creates a new Alexa emulator
     * @param skillURL The URL the skill is listening that this emulator should interact with
     * @param intentSchemaFile The path to the intent schema file - defaults to {@link BSTAlexa.DefaultIntentSchemaLocation}.
     * @param sampleUtterancesFile The path to the samples utterances file - defaults to {@link BSTAlexa.DefaultSampleUtterancesLocation}.
     * @param applicationID The application ID. Just makes one up if none is defined.
     */
    public constructor(private skillURL: string,
                       private intentSchemaFile?: string,
                       private sampleUtterancesFile?: string,
                       private applicationID?: string) {
        if (this.intentSchemaFile === undefined || this.intentSchemaFile === null) {
            this.intentSchemaFile = BSTAlexa.DefaultIntentSchemaLocation;
        }

        if (this.sampleUtterancesFile === undefined || this.sampleUtterancesFile === null) {
            this.sampleUtterancesFile =  BSTAlexa.DefaultSampleUtterancesLocation;
        }

        this._alexa = new Alexa();
        if (this.applicationID !== undefined && this.applicationID !== null) {
            Global.config().updateApplicationID(this.applicationID);
        }
    }

    /**
     * Start the emulator
     * @param ready Passes back an error if there are any issues with initialization
     */
    public start(ready: (error?: string) => void): void {
        let self = this;
        InteractionModel.fromFiles(this.intentSchemaFile, this.sampleUtterancesFile, function(model: InteractionModel, error: string) {
            if (error !== undefined && error !== null) {
                ready(error);
            } else {
                self._alexa.startSession(self.skillURL, model, true, self.applicationID);
                ready();
            }
        });
    }

    /**
     * Registers a callback for Skill events
     *
     * For AudioPlayer events, the payload is an {@link AudioItem}
     *
     * For event type {@link BSTAlexaEvents.Response}, the payload is the response body as JSON
     *  A second parameter with the body of the request as JSON is also passed
     *
     * @param eventType {@link BSTAlexaEvents}
     * @param callback
     * @return Itself
     */
    public on(eventType: string, callback: Function): BSTAlexa {
        if (eventType.startsWith("AudioPlayer")) {
            if (!BSTAlexa.validateAudioEventType(eventType)) {
                throw Error("No event type: " + eventType + " is defined");
            }

            if (this._alexa.context().audioPlayerEnabled()) {
                this._alexa.context().audioPlayer().on(eventType, callback);
            }
        } else if (eventType === BSTAlexaEvents.Response) {
            this._alexa.on(AlexaEvent.SkillResponse, callback);
        } else {
            throw Error("No event type: " + eventType + " is defined");
        }

        return this;
    }

    /**
     * Registers a one-time callback for Skill events
     *
     * For AudioPlayer events, the payload is an {@link AudioItem}
     *
     * For event type {@link BSTAlexaEvents.Response}, the payload is the response body as JSON
     *  A second parameter with the body of the request as JSON is also passed
     *
     * @param eventType {@link BSTAlexaEvents}
     * @param callback
     * @returns Itself
     */
    public once(eventType: string, callback: Function): BSTAlexa {
        if (eventType.startsWith("AudioPlayer")) {
            if (!BSTAlexa.validateAudioEventType(eventType)) {
                throw Error("No event type: " + eventType + " is defined");
            }

            if (this._alexa.context().audioPlayerEnabled()) {
                this._alexa.context().audioPlayer().once(eventType, callback);
            }
        } else if (eventType === BSTAlexaEvents.Response) {
            this._alexa.once(AlexaEvent.SkillResponse, callback);
        } else {
            throw Error("No event type: " + eventType + " is defined");
        }

        return this;
    }

    /**
     * Emulates the specified phrase being said to an Alexa device
     * @param phrase
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public spoken(phrase: string, callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        this._alexa.spoken(phrase, function (error: any, response: any, request: any) {
            if (callback !== undefined && callback !== null) {
                callback(error, response, request);
            }
        });
        return this;
    }

    /**
     * Emulates the specified intent coming from the Alexa device.
     * @param intentName The name of the intent - must exactly match the IntentSchema
     * @param slots A key-value dictionary of slots in the form { "slotName": "slotValue" }
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public intended(intentName: string, slots?: {[id: string]: string}, callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        this._alexa.intended(intentName, slots, function (error: any, response: any, request: any) {
            if (callback !== undefined && callback !== null) {
                callback(error, response, request);
            }
        });
        return this;
    }

    /**
     * Emulates the specified skill being launched
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public launched(callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        this._alexa.launched(callback);
        return this;
    }

    /**
     * Ends the session - requires a reason
     * @param sessionEndedReason Can be ERROR, EXCEEDED_MAX_REPROMPTS or USER_INITIATED
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public sessionEnded(sessionEndedReason: string, callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        // Convert to enum value
        const sessionEndedEnum = (<any> SessionEndedReason)[sessionEndedReason];
        this._alexa.sessionEnded(sessionEndedEnum, null, callback);
        return this;
    }

    /**
     * Emulates the current track playing to completion.
     *
     * The Alexa Emulator will automatically play the next queued track
     *  as well as signal to your skill the current track has completed
     *
     *  @param callback Returns any error, along the response and request JSON associated with this call
     *  @returns Itself
     */
    public playbackFinished(callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        if (this._alexa.context().audioPlayerEnabled()) {
            if (this._alexa.context().audioPlayer().isPlaying()) {
                this._alexa.context().audioPlayer().playbackFinished(callback);
            }
        }
        return this;
    }

    /**
     * Triggers a AudioPlayer.PlaybackNearlyFinished request from Alexa
     *
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public playbackNearlyFinished(callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        if (this._alexa.context().audioPlayerEnabled()) {
            if (this._alexa.context().audioPlayer().isPlaying()) {
                this._alexa.context().audioPlayer().playbackNearlyFinished(callback);
            }
        }
        return this;
    }

    /**
     * Triggers a AudioPlayer.PlaybackStopped request from Alexa
     *
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public playbackStopped(callback?: (error: any, response: any, request: any) => void): BSTAlexa {
        if (this._alexa.context().audioPlayerEnabled()) {
            if (this._alexa.context().audioPlayer().isPlaying()) {
                this._alexa.context().audioPlayer().playbackStopped(callback);
            }
        }
        return this;
    }

    /**
     * Emulates the track being played back
     *
     * Updates the offset time on the track
     * @param offsetInMilliseconds
     * @returns Itself
     */
    public playbackOffset(offsetInMilliseconds: number): BSTAlexa {
        this._alexa.context().audioPlayer().playbackOffset(offsetInMilliseconds);
        return this;
    }

    /**
     * Turns off the Alexa emulator.
     * Useful for running inside of tests to ensure all cleanup has completed before next test starts.
     * @param onStop
     */
    public stop(onStop: () => void) {
        this._alexa.stop(onStop);
    }

    private static validateAudioEventType(eventType: string): boolean {
        let match = false;
        for (let e of BSTAlexa.AudioPlayerEvents) {
            if (eventType === e) {
                match = true;
                break;
            }
        }
        return match;
    }
}
