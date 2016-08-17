import * as fs from "fs";
import {FileUtil} from "./file-util";

/**
 * Parses and interprets an interaction model
 * Takes in intent schema and sample utterances from files
 * Then can take a phrase and create an intent request based on it
 */
export class InteractionModel {
    public constructor() {}

    public loadIntentSchema(intentSchemaFile: string): void {
        FileUtil.readFile(intentSchemaFile, function (data: Buffer) {

        });
    }

    public loadSampleUtterances(file: string): void {

    }

    public matchUtterance(utterance: string): string {

    }

    public intent(utterance: string): string {

    }
}
