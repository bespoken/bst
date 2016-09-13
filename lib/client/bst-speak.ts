import {SkillInvoker, InvokeCallback} from "../alexa/skill-invoker";
import {InteractionModel} from "../alexa/interaction-model";
import {AudioPlayer} from "../alexa/audio-player";
import {AlexaSession} from "../alexa/alexa-session";

const DefaultIntentSchemaLocation = "speechAssets/IntentSchema.json";
const DefaultSampleUtterancesLocation = "speechAssets/SampleUtterances.txt";

/**
 * Programmatic interface for the speak command
 */
export class BSTSpeak {
    private skillInvoker: SkillInvoker = null;
    private interactionModel: InteractionModel = null;
    private audioPlayer: AudioPlayer = null;
    private session: AlexaSession = null;

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
                self.session = new AlexaSession(self.interactionModel, self.applicationID);
                self.skillInvoker = new SkillInvoker(self.skillURL, self.session);
                self.audioPlayer = new AudioPlayer(self.session, self.skillInvoker);

                ready();
            }
        });
    }

    public speak(phrase: string, callback: InvokeCallback) {
        let self = this;
        this.skillInvoker.say(phrase, function (request: any, response: any, error?: string) {
            // Check if there are any audio directives when it comes back
            if (response.response.directives !== undefined) {
                self.audioPlayer.directivesReceived(response.response.directives);

            }
            callback(request, response, error);
        });
    }

    public on(eventType: string, listener: Function) {
        if (eventType.startsWith("AudioPlayer")) {

        }
    }
}
