const uuid = require("node-uuid");

export class AlexaContext {
    private _applicationID: string;
    private _userID: string;

    public constructor(public skillURL: string, applicationID?: string) {
        this._applicationID = applicationID;
    }

    public applicationID(): string {
        // Generate an application ID if it is not set
        if (this._applicationID === undefined || this._applicationID === null) {
            this._applicationID = "amzn1.echo-sdk-ams.app." + uuid.v4();
        }
        return this._applicationID;
    }


    public userID(): string {
        return this._userID;
    }
}
