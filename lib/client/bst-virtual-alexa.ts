import {Global} from "../core/global";
import {SkillContext, VirtualAlexa} from "virtual-alexa";
import * as fs from "fs";

interface SavedSession {
    id: string;
    attributes: {
        [id: string]: any
    };
}
/**
 * Programmatic interface for interacting with the Virtual Alexa.
 *
 */
export class BSTVirtualAlexa {
    public static DefaultIntentSchemaLocation = "speechAssets/IntentSchema.json";
    public static DefaultSampleUtterancesLocation = "speechAssets/SampleUtterances.txt";
    public static DefaultInteractionModelLocation = "models/en-US.json";

    private virtualAlexa: VirtualAlexa = null;
    private interactionModelProvided: boolean = false;
    private sampleUtterancesProvided: boolean = false;
    private intentSchemaProvided: boolean = false;

    private static FileTypes = {
        InterationModel: "Interaction Model",
        IntentSchema: "Intent Schema",
        SampleUtterances: "Sample Utterances"
    };

    private saveSession(): void {
        if (Global.config()) {
            const session = this.virtualAlexa.context().session();
            if (!session) {
                Global.config().deleteSession();
                return;
            }

            const savedSession: SavedSession = {
                id: session.id(),
                attributes: session.attributes(),
            };

            Global.config().saveSession(savedSession);
        }
    }

    public deleteSession(): void {
        Global.config().deleteSession();
    }

    private loadSession(): void {
        if (Global.config()) {
            const savedSession = Global.config().loadSession() as SavedSession;
            if (savedSession) {
                this.virtualAlexa.context().session().setID(savedSession.id);
                this.virtualAlexa.context().session().updateAttributes(savedSession.attributes);
            }
        }
    }

    /**
     * Creates a new Alexa emulator
     * @param skillURL The URL the skill is listening that this emulator should interact with
     * @param interactionModel The path to the interaction model file - defaults to {@link BSTAlexa.DefaultInteractionModelLocation}.
     * @param intentSchemaFile The path to the intent schema file - defaults to {@link BSTAlexa.DefaultIntentSchemaLocation}.
     * @param sampleUtterancesFile The path to the samples utterances file - defaults to {@link BSTAlexa.DefaultSampleUtterancesLocation}.
     * @param applicationID The application ID. Just makes one up if none is defined.
     */
    public constructor(private skillURL: string,
                       private interactionModel?: string,
                       private intentSchemaFile?: string,
                       private sampleUtterancesFile?: string,
                       private applicationID?: string,
                       private locale?: string) {
        if ((intentSchemaFile || sampleUtterancesFile) && interactionModel) {
            console.error("The Interaction Model and Intent Schema Files should not both be specified. It should be one or the other.");
            throw new Error("The Interaction Model and Intent Schema Files should not both be specified. It should be one or the other.");
        }

        if (!this.interactionModel) {
            this.interactionModel = BSTVirtualAlexa.DefaultInteractionModelLocation;
        } else {
            this.interactionModelProvided = true;
        }

        if (!this.intentSchemaFile) {
            this.intentSchemaFile = BSTVirtualAlexa.DefaultIntentSchemaLocation;
        } else {
            this.intentSchemaProvided = true;
        }

        if (!this.sampleUtterancesFile) {
            this.sampleUtterancesFile =  BSTVirtualAlexa.DefaultSampleUtterancesLocation;
        } else {
            this.sampleUtterancesProvided = true;
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

    private validateFile(file: string, fileType: string) {
        if (!fs.existsSync(file)) {
            console.error("Error loading " + fileType);
            console.error("Cause: '" + this.interactionModel + "' doesn't exist");
            throw new Error("Error loading " + fileType + ", file not found");
        }
    }

    private validateJsonFiles(fileLocation: string, fileType: string) {
        const fileContent = fs.readFileSync(fileLocation);
        try {
            JSON.parse(fileContent.toString());
        } catch (error) {
            console.error("Error loading '" + fileType + "', incorrect JSON");
            console.error("Cause: ", error.message);
            throw new Error("Error loading '" + fileType + "', incorrect JSON");
        }
    }

    private validateFilesAndBuild(): VirtualAlexa {
        const builder = VirtualAlexa.Builder().applicationID(this.applicationID).skillURL(this.skillURL);
        let usingInteractionModel = false;

        if (this.locale) {
            builder.locale(this.locale);
            if (!this.interactionModelProvided) {
                // If we don't have an interaction Model and have a locale, search in the default models/<locale>.json location
                this.interactionModel = this.interactionModel.replace("en-US", this.locale);
            }
        }

        if (!(this.interactionModelProvided || this.intentSchemaProvided)) {
            // No model provided, we check if default files exists
            if (fs.existsSync(this.interactionModel)) {
                usingInteractionModel = true;
            } else if (!(fs.existsSync(this.intentSchemaFile) && fs.existsSync(this.sampleUtterancesFile))) {
                // Model don't exist in default locations
                console.error("Error loading Interaction model, no file provided and none found in default locations");
                throw new Error("Error loading Interaction model, no file provided and none found in default locations");
            }
        } else {
            if (this.interactionModelProvided) {
                this.validateFile(this.interactionModel, BSTVirtualAlexa.FileTypes.InterationModel);
                usingInteractionModel = true;
            } else {
                if (!fs.existsSync(this.intentSchemaFile)) {
                    this.validateFile(this.intentSchemaFile, BSTVirtualAlexa.FileTypes.IntentSchema);
                }

                if (!fs.existsSync(this.sampleUtterancesFile)) {
                    this.validateFile(this.sampleUtterancesFile, BSTVirtualAlexa.FileTypes.SampleUtterances);
                }
            }
        }

        // We know which file we are using at that it exist, we just need to assure the Json inside is valid

        if (usingInteractionModel) {
            this.validateJsonFiles(this.interactionModel, BSTVirtualAlexa.FileTypes.InterationModel);
            builder.interactionModelFile(this.interactionModel);
        } else {
            this.validateJsonFiles(this.intentSchemaFile, BSTVirtualAlexa.FileTypes.IntentSchema);
            builder.intentSchemaFile(this.intentSchemaFile).sampleUtterancesFile(this.sampleUtterancesFile);
        }

        return builder.create();
    }

    /**
     * Start the emulator
     */
    public start(): void {
        this.virtualAlexa = this.validateFilesAndBuild();
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
        this.loadSession();
        this.virtualAlexa.utter(phrase).then((payload) => {
            this.saveSession();
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
        this.loadSession();
        this.virtualAlexa.intend(intentName, slots).then((payload) => {
            this.saveSession();
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
            this.saveSession();
            callback(null, payload, request);
        }).catch(error => {
            callback(error, null, request);
        });
        return this;
    }
}
