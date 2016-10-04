import {InteractionModel} from "../alexa/interaction-model";
import {Alexa, AlexaResponseCallback, AlexaEvent} from "../alexa/alexa";
import {Global} from "../core/global";
import {AudioPlayerState} from "../alexa/audio-player";

export class BSTAlexaEvents {
    /**
     * Fired when an {@link AudioItem} begins playing.
     *
     * Payload is an {@link AudioItem}.
     */
    public static AudioPlayerPlaybackStarted = "AudioPlayer.PlaybackStarted";

    /**
     * Fired when an error occurs.
     *
     * Payload is the error.
     */
    public static Error = "error";

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
     * Registers a callback for Skill responses
     * For event type {@link BSTAlexaEvents.Response}, the payload is the response body as JSON
     *  A second parameter with the body of the request as JSON is also passed
     * For event type {@link BSTAlexaEvents.Error}, the payload is the error.
     * @param eventType {@link BSTAlexaEvents}
     * @param callback
     */
    public on(eventType: string, callback: Function): void {
        if (eventType === BSTAlexaEvents.AudioPlayerPlaybackStarted) {
            if (this._alexa.context().audioPlayerEnabled()) {
                this._alexa.context().audioPlayer().on(AudioPlayerState.PlaybackStarted, callback);
            }
        } else if (eventType === BSTAlexaEvents.Error) {
            this._alexa.on(AlexaEvent.SkillError, callback);
        } else if (eventType === BSTAlexaEvents.Response) {
            this._alexa.on(AlexaEvent.SkillResponse, callback);
        } else {
            throw Error("No event type: " + eventType + " is defined");
        }
    }

    /**
     * Emulates the specified phrase being said to an Alexa device
     * @param phrase
     * @param callback
     */
    public spoken(phrase: string, callback?: AlexaResponseCallback): void {
        this._alexa.spoken(phrase, function (request: any, response: any, error?: string) {
            if (callback !== undefined && callback !== null) {
                callback(request, response, error);
            }
        });
    }

    /**
     * Emulates the specified intent coming from the Alexa device.
     * @param intentName The name of the intent - must exactly match the IntentSchema
     * @param slots A key-value dictionary of slots in the form { "slotName": "slotValue" }
     * @param callback
     */
    public intended(intentName: string, slots?: {[id: string]: string}, callback?: AlexaResponseCallback): void {
        this._alexa.intended(intentName, slots, function (request: any, response: any, error?: string) {
            if (callback !== undefined && callback !== null) {
                callback(request, response, error);
            }
        });
    }

    /**
     * Emulates the current track playing to completion.
     * The Alexa Emulator will automatically play the next queued track
     *  as well as signal to your skill the current track has completed
     *  @returns Returns false if not audio item is currently playing
     */
    public audioItemFinished(): boolean {
        let playing = false;
        if (this._alexa.context().audioPlayerEnabled()) {
            if (this._alexa.context().audioPlayer().isPlaying()) {
                playing = true;
                this._alexa.context().audioPlayer().fastForward();
            }
        }
        return playing;
    }

    /**
     * Turns off the Alexa emulator.
     * Useful for running inside of tests to ensure all cleanup has completed before next test starts.
     * @param onShutdown
     */
    public stop(onStop: () => void) {
        this._alexa.stop(onStop);
    }
}
