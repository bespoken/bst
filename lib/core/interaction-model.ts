import * as fs from "fs";

/**
 * Parses and interprets an interaction model
 * Takes in intent schema and sample utterances from files
 * Then can take a phrase and create an intent request based on it
 */
export class InteractionModel {
    public constructor() {}

    public loadIntentSchema(file: string): void {
        fs.readFile(file, "UTF-8", function (error: string, data: string) {

        });
    }

    public loadSampleUtterances(file: string): void {

    }

    public matchUtterance(utterance: string): string {

    }

    public intent(utterance: string): string {

    }
}
