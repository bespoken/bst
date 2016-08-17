import {FileUtil} from "../core/file-util";
import {LoggingHelper} from "../core/logging-helper";

const Logger = "SAMPLES";
export class SampleUtterances {
    public samples: {[id: string]: Array<string>} = {};
    public constructor() {

    }

    public static fromFile(file: string, callback: (sampleUtterances: SampleUtterances) => void) {
        FileUtil.readFile(file, function(data: Buffer) {
            if (data !== null) {
                let sampleUtterances = new SampleUtterances();
                sampleUtterances.parseFlatFile(data.toString());
                callback(sampleUtterances);
            } else {
                LoggingHelper.error(Logger, "File not found: " + file);
                callback(null);
            }
        });
    }

    public static fromJSON(sampleUtterancesJSON: any) {
        let sampleUtterances = new SampleUtterances();
        for (let intent in sampleUtterancesJSON) {
            sampleUtterances.samples[intent] = sampleUtterancesJSON[intent];
        }
        return sampleUtterances;
    }

    public intentForPhrase(phrase: string) {
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

    private parseFlatFile(fileData: string) {
        let lines = fileData.split("\n");
        for (let line of lines) {
            let lineArray = line.split(" ", 1);
            let intent = line[0];
            let sample = line[1];
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
