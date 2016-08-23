import {SkillInvoker} from "../alexa/skill-invoker";
import {InteractionModel} from "../alexa/interaction-model";

const DefaultIntentSchemaLocation = "speechAssets/IntentSchema.json";
const DefaultSampleUtterancesLocation = "speechAssets/SampleUtterances.txt";

/**
 * Programmatic interface for the speak command
 */
export class BSTSpeak {
    private skillInvoker: SkillInvoker = null;
    private interactionModel: InteractionModel = null;

    public constructor(public skillURL: string,
                       public intentSchemaFile?: string,
                       public sampleUtterancesFile?: string,
                       public applicationID?: string) {
        if (this.intentSchemaFile === undefined || this.intentSchemaFile === null) {
            this.intentSchemaFile = DefaultIntentSchemaLocation;
        }

        if (this.sampleUtterancesFile === undefined || this.sampleUtterancesFile === null) {
            this.sampleUtterancesFile = DefaultSampleUtterancesLocation;
        }
    }

    public initialize(ready: (error?: string) => void) {
        let self = this;
        InteractionModel.fromFiles(this.intentSchemaFile, this.sampleUtterancesFile, function(model: InteractionModel, error: string) {
            if (error !== undefined && error !== null) {
                ready(error);
            } else {
                self.interactionModel = model;
                self.skillInvoker = new SkillInvoker(self.skillURL, self.interactionModel, self.applicationID);
                ready();
            }
        });
    }

    public speak(phrase: string, callback: (request: any, response: any, error?: string) => void) {
        this.skillInvoker.say(phrase, callback);
    }

    public reset() {
        this.skillInvoker.serviceRequest.resetSession();
    }
}
