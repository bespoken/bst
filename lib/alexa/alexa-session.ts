const uuid = require("node-uuid");

export class AlexaSession {
    private _attributes: {[id: string]: any};
    private _new: boolean;
    private _id: string;

    public constructor () {
        this._id = "SessionID." + uuid.v4();
        this._new = true;
        this._attributes = {};
    }

    public attributes(): {[id: string]: any} {
        return this._attributes;
    }

    public updateAttributes(sessionAttributes: any) {
        if (sessionAttributes !== undefined && sessionAttributes !== null) {
            this._attributes = sessionAttributes;
        }

    }

    public id(): string {
        return this._id;
    }

    public isNew(): boolean {
        return this._new;
    }

    public used(): void {
        this._new = false;
    }
}