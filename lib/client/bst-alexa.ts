import {InteractionModel} from "../alexa/interaction-model";
import {Alexa, AlexaResponseCallback} from "../alexa/alexa";
import {Global} from "../core/global";


/**
 * Programmatic interface for interacting with the Bespoken Tools Alexa emulator
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
     * Initialize the emulator
     * @param ready Passes back an error if there are any issues with initialization
     */
    public initialize(ready: (error?: string) => void) {
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
     * @param callback
     */
    public onSkillResponse(callback: (skillRequestJSON: any, skillResponseJSON: any) => void) {
        this._alexa.onSkillResponse(callback);
    }

    /**
     * Emulates the specified phrase being said to an Alexa device
     * @param phrase
     * @param callback
     */
    public spoken(phrase: string, callback?: AlexaResponseCallback) {
        this._alexa.spoken(phrase, function (request: any, response: any, error?: string) {
            if (callback !== undefined && callback !== null) {
                callback(request, response, error);
            }
        });
    }

    /**
     * Emulates the specified intent coming from the Alexa device.
     * @param intentName
     * @param slots
     * @param callback
     */
    public intended(intentName: string, slots: any, callback?: AlexaResponseCallback) {
        this._alexa.intended(intentName, slots, function (request: any, response: any, error?: string) {
            if (callback !== undefined && callback !== null) {
                callback(request, response, error);
            }
        });
    }

    /**
     * Turns off the Alexa emulator.
     * Useful for running inside of tests to ensure all cleanup has completed before next test starts.
     * @param onShutdown
     */
    public shutdown(onShutdown: () => void) {
        this._alexa.shutdown(onShutdown);
    }
}
