import {FileUtil} from "../core/file-util";

export class IntentSchema {
    public constructor(public schemaJSON: any) {

    }

    public static fromFile(file: string, callback: (intentSchema: IntentSchema, error?: string) => void): void {
        FileUtil.readFile(file, function (data: Buffer) {
            if (data !== null) {
                let json: any = null;
                try {
                    json = JSON.parse(data.toString());
                    let schema = new IntentSchema(json);
                    callback(schema);
                } catch (e) {
                    callback(null, "Bad JSON: " + e.message);
                }
            } else {
                let error = "File not found: " + file;
                callback(null, error);
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

    public intent(intentString: string): Intent {
        let intent: Intent = null;
        for (let o of this.intents()) {
            if (o.name === intentString) {
                intent = o;
                break;
            }
        }
        return intent;
    }

    public hasIntent(intentString: string): boolean {
        return this.intent(intentString) !== null;
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
    public constructor(public name: string, public type: string) {}
}

