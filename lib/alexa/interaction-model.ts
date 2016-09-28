import {IntentSchema} from "./intent-schema";
import {SampleUtterances} from "./sample-utterances";
import {UtteredIntent} from "./sample-utterances";

/**
 * Parses and interprets an interaction model
 * Takes in intentName schema and sample utterances from files
 * Then can take a phrase and create an intentName request based on it
 */
export class InteractionModel {
    public static fromFiles(intentSchemaFile: string,
                           sampleUtterancesFile: string,
                           callback: (interactionModel: InteractionModel, error?: string) => void) {
        let callbackCount = 0;
        let callbackError: string = null;
        let intentSchema: IntentSchema = null;
        let sampleUtterances: SampleUtterances = null;

        // Collect responses from the two callbacks
        let done = function (schema: IntentSchema, utterances: SampleUtterances, error: string) {
            callbackCount++;
            if (schema !== undefined && schema !== null) {
                intentSchema = schema;
            }

            if (utterances !== undefined && utterances !== null) {
                sampleUtterances = utterances;
            }

            if (error !== undefined && error !== null) {
                callbackError = error;
            }

            // All done!
            if (callbackCount === 2) {
                if (callbackError !== null) {
                    callback(null, callbackError);
                } else {
                    callback(new InteractionModel(intentSchema, sampleUtterances));
                }
            }
        };

        IntentSchema.fromFile(intentSchemaFile, function(schema: IntentSchema, error: string) {
            if (error !== undefined && error !== null) {
                console.error("Error loading Intent Schema!");
                console.error("Cause: " + error);
                console.error();
            }
            done(schema, null, error);
        });

        SampleUtterances.fromFile(sampleUtterancesFile, function(utterances: SampleUtterances, error: string) {
            if (error !== undefined && error !== null) {
                console.error("Error loading Sample Utterances!");
                console.error("Cause: " + error);
                console.error();
            }
            done(null, utterances, error);
        });

    }

    public constructor(public intentSchema: IntentSchema, public sampleUtterances: SampleUtterances) {}


    public intentForUtterance(utterance: string): UtteredIntent {
        return this.sampleUtterances.intentForUtterance(utterance);
    }

    public hasIntent(intent: string): boolean {
        return this.intentSchema.hasIntent(intent);
    }
}
