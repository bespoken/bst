import {FileUtil} from "../core/file-util";

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
                callback(null, error);
            }
        });
    }

    public static fromJSON(sampleUtterancesJSON: any): SampleUtterances {
        let sampleUtterances = new SampleUtterances();
        for (let intent of Object.keys(sampleUtterancesJSON)) {
            sampleUtterances.samples[intent] = sampleUtterancesJSON[intent];
        }
        return sampleUtterances;
    }

    /**
     * To handle the case when what is said does not match any sample utterance
     */
    public defaultUtterance(): string {
        // Just grab the first sample for now
        let firstIntent = Object.keys(this.samples)[0];
        return this.samples[firstIntent][0];
    }

    /**
     * Returns an uttered intentName tuple for the phrase
     * The uttered intentName has the intentName name and slot information
     * @param phraseString
     * @returns {UtteredIntent}
     */
    public intentForUtterance(phraseString: string): UtteredIntent {
        let phrase = new Phrase(phraseString);

        let matchedIntent: UtteredIntent = null;
        for (let intent of Object.keys(this.samples)) {
            let samples = this.samples[intent];
            for (let sample of samples) {
                if (phrase.matchesUtterance(sample)) {
                    matchedIntent = new UtteredIntent(intent, phraseString, new Phrase(sample));
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
                // We skip blank lines - which is what Alexa does
                continue;
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

/**
 * Helper class for handling phrases - breaks out the slots within a phrase
 */
export class Phrase {
    public slots: Array<string> = [];
    public normalizedPhrase: string = null;

    public constructor(public phrase: string) {
        this.normalizeSlots(this.phrase);
    }

    /**
     * Takes a phrase like "This is a {Slot}" and turns it into "This is a {}"
     * This is so we can compare the sample utterances (which have names that tie off to the slot names defined in the
     *  intent schema) with the actual utterance, which have values in the slot positions (as opposed to the names)
     * @param utterance
     */
    public normalizeSlots(utterance: string): void {
        // Slots are indicated by {braces}
        let slotlessUtterance = "";
        let index = 0;
        let done = false;
        while (!done) {
            let startSlotIndex = utterance.indexOf("{", index);
            if (startSlotIndex !== -1) {
                let endSlotIndex = utterance.indexOf("}", startSlotIndex);

                // Get the contents of the slot and put it in an array
                let slotValue = utterance.substr(startSlotIndex + 1, endSlotIndex - (startSlotIndex + 1));
                this.slots.push(slotValue);

                slotlessUtterance += utterance.substr(index, startSlotIndex - index + 1) + "}";

                index = endSlotIndex + 1;
            } else {
                slotlessUtterance += utterance.substr(index);
                done = true;
            }
        }
        this.normalizedPhrase = slotlessUtterance;
    }

    public matchesUtterance(otherPhraseString: string): boolean {
        return this.matches(new Phrase(otherPhraseString));
    }

    public matches(otherPhrase: Phrase): boolean {
        return this.normalizedPhrase.toLowerCase() === otherPhrase.normalizedPhrase.toLowerCase();
    }
}

/**
 * Object to hold tuple of intentName name, utterance, and the matched phrase
 *
 * Helpful for handling slots
 */
export class UtteredIntent {
    public constructor(public intentName: string, public utterance: string, public matchedPhrase: Phrase) {}

    public slotCount(): number {
        return this.matchedPhrase.slots.length;
    }

    public slotName(index: number) {
        return this.matchedPhrase.slots[index];
    }

    public slotValue(index: number) {
        return new Phrase(this.utterance).slots[index];
    }

    public toJSON(): any {
        let json: any = {};
        for (let i = 0; i < this.slotCount(); i++) {
            json[this.slotName(i)] = this.slotValue(i);
        }
        return json;
    }
}
