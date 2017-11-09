import {Global} from "../core/global";
import {SkillContext, VirtualAlexa} from "virtual-alexa";

/**
 * Programmatic interface for interacting with the Virtual Alexa.
 *
 */
export class BSTVirtualAlexa {
    public static DefaultIntentSchemaLocation = "speechAssets/IntentSchema.json";
    public static DefaultSampleUtterancesLocation = "speechAssets/SampleUtterances.txt";
    private virtualAlexa: VirtualAlexa = null;
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
        if (!this.intentSchemaFile) {
            this.intentSchemaFile = BSTVirtualAlexa.DefaultIntentSchemaLocation;
        }

        if (!this.sampleUtterancesFile) {
            this.sampleUtterancesFile =  BSTVirtualAlexa.DefaultSampleUtterancesLocation;
        }

        // If we have a config, update it with the application ID, or use it
        if (Global.config()) {
            if (this.applicationID) {
                Global.config().updateApplicationID(this.applicationID);
            } else {
                this.applicationID = Global.config().applicationID();
            }
        }
    }

    /**
     * Returns internal virtual alexa context
     */
    public context(): SkillContext {
        return this.virtualAlexa.context();
    }

    /**
     * Start the emulator
     */
    public start(): void {
        try {
            this.virtualAlexa = VirtualAlexa.Builder()
                .intentSchemaFile(this.intentSchemaFile)
                .sampleUtterancesFile(this.sampleUtterancesFile)
                .applicationID(this.applicationID)
                .skillURL(this.skillURL)
                .create();
        } catch (error) {
            if (error.message.indexOf("ENOENT") !== -1) {
                console.error("Error loading Interaction model, please check the provided files");
                console.error("Cause: " + error.message);
                console.error();
                throw error;
            }
            throw error;
        }
    }

    /**
     * Emulates the specified phrase being said to an Alexa device.
     *
     * @param phrase
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public spoken(phrase: string, callback?: (error: any, response: any, request: any) => void): BSTVirtualAlexa {
        let request: any;
        this.virtualAlexa.filter((generatedRequest) => { request = generatedRequest; });

        this.virtualAlexa.utter(phrase).then((payload) => {
            if (callback !== undefined && callback !== null) {
                    callback(null, payload, request);
            }
        }).catch(error => {
            callback(error, null, request);
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
    public intended(intentName: string, slots?: {[id: string]: string}, callback?: (error: any, response: any, request: any) => void): BSTVirtualAlexa {
        let request: any;
        this.virtualAlexa.filter((generatedRequest) => { request = generatedRequest; });

        this.virtualAlexa.intend(intentName, slots).then((payload) => {
            if (callback !== undefined && callback !== null) {
                callback(null, payload, request);
            }
        }).catch(error => {
            callback(error, null, request);
        });

        return this;
    }

    /**
     * Emulates the specified skill being launched
     * @param callback Returns any error, along the response and request JSON associated with this call
     * @returns Itself
     */
    public launched(callback?: (error: any, response: any, request: any) => void): BSTVirtualAlexa {
        let request: any;
        this.virtualAlexa.filter((generatedRequest) => { request = generatedRequest; });

        this.virtualAlexa.launch().then(payload => {
                callback(null, payload, request);
        }).catch(error => {
            callback(error, null, request);
        });
        return this;
    }
}
