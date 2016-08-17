import {FileUtil} from "../core/file-util";
import {LoggingHelper} from "../core/logging-helper";
const Logger = "SCHEMA";

export class IntentSchema {
    public constructor(public schemaJSON: any) {

    }

    public static fromFile(file: string, callback: (intentSchema: IntentSchema) => void): void {
        FileUtil.readFile(file, function (data: Buffer) {
            if (data !== null) {
                let json = JSON.parse(data.toString());
                let schema = new IntentSchema(json);
                callback(schema);
            } else {
                LoggingHelper.error(Logger, "File not found: " + file);
                callback(null);
            }
        });
    }

    public static fromJSON(schemaJSON: any): IntentSchema {
        return new IntentSchema(schemaJSON);
    }

    public intents(): Array<Intent> {
        let intentArray: Array<Intent> = [];
        for (let intentJSON of this.schemaJSON.intents) {
            let intent = new Intent(intentJSON.intent);
            if (intentJSON.slots !== undefined && intentJSON.slots !== null) {
                for (let slotJSON of intentJSON.slots) {
                    intent.addSlot(new IntentSlot(slotJSON.name, slotJSON.type));
                }
            }
            intentArray.push(intent);
        }
        return intentArray;
    }

    /**
     * Formats a JSON-payload that can be sent to an Alexa service for the specified intent
     * @param intentName
     */
    public requestForIntent(intentName: string) {

    }
}

export class Intent {
    public builtin: boolean = false;
    public slots: Array<IntentSlot> = null;
    public constructor(public name: string) {
        if (this.name.indexOf("AMAZON") !== -1) {
            this.builtin = true;
        }
    }

    public addSlot(slot: IntentSlot): void {
        if (this.slots === null) {
            this.slots = [];
        }

        this.slots.push(slot);
    }
}

export class IntentSlot {
    public constructor(public name: string, public type: string) {

    }
}

