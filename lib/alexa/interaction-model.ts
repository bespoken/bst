import * as fs from "fs";
import {FileUtil} from "./../core/file-util";
import {IntentSchema} from "./intent-schema";
import {SampleUtterances} from "./sample-utterances";

/**
 * Parses and interprets an interaction model
 * Takes in intent schema and sample utterances from files
 * Then can take a phrase and create an intent request based on it
 */
export class InteractionModel {
    public constructor(public intentSchema: IntentSchema, public sampleUtterances: SampleUtterances) {}


    public intentForUtterance(utterance: string): string {
        return null;
    }

    public hasIntent(intent: string): boolean {
        let match = false;
        for (let i in this.intentSchema.intents()) {
            if (i === intent) {
                match = true;
                break;
            }
        }
        return match;
    }
}
