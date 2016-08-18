import {FileUtil} from "../core/file-util";
import {LoggingHelper} from "../core/logging-helper";

const Logger = "SAMPLES";
export class SampleUtterances {
    public samples: {[id: string]: Array<string>} = {};
    public constructor() {

    }

    public static fromFile(file: string, callback: (sampleUtterances: SampleUtterances, error?: string) => void) {
        FileUtil.readFile(file, function(data: Buffer) {
            if (data !== null) {
                let sampleUtterances = new SampleUtterances();
                try {
                    sampleUtterances.parseFlatFile(data.toString());
                    callback(sampleUtterances);
                } catch (e) {
                    callback(null, e.message);
                }
            } else {
                let error = "File not found: " + file;
                LoggingHelper.error(Logger, error);
                callback(null, error);
            }
        });
    }

    public static fromJSON(sampleUtterancesJSON: any): SampleUtterances {
        let sampleUtterances = new SampleUtterances();
        for (let intent in sampleUtterancesJSON) {
            sampleUtterances.samples[intent] = sampleUtterancesJSON[intent];
        }
        return sampleUtterances;
    }

    public intentForPhrase(phrase: string): string {
        let matchedIntent: string = null;
        for (let intent in this.samples) {
            let samples = this.samples[intent];
            for (let sample of samples) {
                if (sample.toLowerCase() === phrase.toLowerCase()) {
                    matchedIntent = intent;
                    break;
                }
            }

            if (matchedIntent !== null) {
                break;
            }
        }
        return matchedIntent;
    }

    public hasIntent(intent: string): boolean {
        return intent in this.samples;
    }

    private parseFlatFile(fileData: string): void {
        let lines = fileData.split("\n");
        for (let line of lines) {
            if (line.trim().length === 0) {
                throw Error("Invalid sample utterance - contains blank line");
            }

            let index = line.indexOf(" ");
            if (index === -1) {
                throw Error("Invalid sample utterance: " + line);
            }

            let intent = line.substr(0, index);
            let sample = line.substr(index).trim();
            let intentSamples: Array<string> = [];
            if (intent in this.samples) {
                intentSamples = this.samples[intent];
            } else {
                this.samples[intent] = intentSamples;
            }

            intentSamples.push(sample);
        }
    }
}
