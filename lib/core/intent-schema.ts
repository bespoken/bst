export class IntentSchema {
    public constructor(public schemaJSON: any) {

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

