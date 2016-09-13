import {InteractionModel} from "./interaction-model";
const uuid = require("node-uuid");

export class AlexaSession {
    private _attributes: {[id: string]: any};
    private _new: boolean;
    private _id: string;
    private _userID: string;

    public constructor(public interactionModel: InteractionModel, private _applicationID?: string) {
        this._id = "SessionID." + uuid.v4();
        // For user ID, take the prefix and tack on a UUID - this is not what Amazon does but should be okay
        this._userID = "amzn1.ask.account." + uuid.v4();
    }

    public applicationID(): string {
        // Generate an application ID if it is not set
        if (this._applicationID === undefined || this._applicationID === null) {
            this._applicationID = "amzn1.echo-sdk-ams.app." + uuid.v4();
        }
        return this._applicationID;
    }

    public attributes(): {[id: string]: any} {
        return this._attributes;
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

    public userID(): string {
        return this._userID;
    }

}