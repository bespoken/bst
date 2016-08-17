import {IntentSchema} from "./intent-schema";
import {InteractionModel} from "./interaction-model";
let uuid = require("node-uuid");

export enum RequestType {
    IntentRequest,
    LaunchRequest,
    SessionEndedRequest
}

/**
 * Creates a the JSON for a Service Request programmatically
 */
export class ServiceRequest {
    public newSession: boolean = true;
    public sessionID: string = null;
    public userID: string = null;
    private requestJSON: any = null;

    public constructor (private interactionModel: InteractionModel, private applicationID?: string) {
        this.resetSession();
    }

    public intentRequest(intentName: string): any {
        if (!this.interactionModel.hasIntent(intentName)) {
            throw new Error("Interaction model has no intent named: " + intentName);
        }
        this.requestJSON = this.generateRequest(RequestType.IntentRequest, intentName);
        return this;
    }

    private generateRequest(requestType: RequestType, intentName: string): any {
        let applicationID = this.getApplicationID();
        // For user ID, take the prefix and tack on a UUID - this is not what Amazon does but should be okay
        if (this.userID === null) {
            this.userID = "amzn1.ask.account." + uuid.v4();
        }

        // First create the header part of the request
        let request: any = {
            "session": {
                "sessionId": this.sessionID,
                "application": {
                    "applicationId": applicationID
                },
                "attributes": {},
                "user": {
                    "userId": this.userID
                },
                "new": this.newSession
            },
            "version": "1.0"
        };

        // Add on the appropriate request type
        if (requestType === RequestType.IntentRequest) {
            request.request = ServiceRequest.generateIntentRequest(intentName);
        }

        this.newSession = false;
        return request;
    }

    private static generateIntentRequest(intentName: string): any {
        let requestID = "EdwRequestId." + uuid.v4();
        let timestamp = ServiceRequest.timestamp();
        return {
            "type": "IntentRequest",
            "requestId": requestID,
            "locale": "en-US",
            "timestamp": timestamp,
            "intent": {
                "name": intentName,
                "slots": {}
            }
        };
    }

    /**
     * The timestamp is a normal JS timestamp without the milliseconds
     */
    private static timestamp() {
        let timestamp = new Date().toISOString();
        return timestamp.substring(0, 18) + "Z";
    }

    public toJSON() {
        return this.requestJSON;
    }

    public resetSession() {
        this.sessionID = "SessionID." + uuid.v4();
        this.newSession = true;
    }

    private getApplicationID(): string {
        // Generate an application ID if it is not set
        if (this.applicationID === undefined || this.applicationID === null) {
            this.applicationID = "amzn1.echo-sdk-ams.app." + uuid.v4();
        }
        return this.applicationID;
    }
}