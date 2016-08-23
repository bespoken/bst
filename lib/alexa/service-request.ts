import {IntentSchema} from "./intent-schema";
import {InteractionModel} from "./interaction-model";
let uuid = require("node-uuid");

export enum RequestType {
    IntentRequest,
    LaunchRequest,
    SessionEndedRequest
}

export enum SessionEndedReason {
    ERROR,
    EXCEEDED_MAX_REPROMPTS,
    USER_INITIATED
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

    /**
     * Generates an intentName request with the specified IntentName
     * @param intentName
     * @returns {ServiceRequest}
     */
    public intentRequest(intentName: string): any {
        if (!this.interactionModel.hasIntent(intentName)) {
            throw new Error("Interaction model has no intentName named: " + intentName);
        }
        this.requestJSON = this.generateRequest(RequestType.IntentRequest, intentName);
        return this;
    }

    /**
     * Adds a slot to the intentName request (it must be an intentName request)
     * @param slotName
     * @param slotValue
     * @returns {ServiceRequest}
     */
    public withSlot(slotName: string, slotValue: string): ServiceRequest {
        if (this.requestJSON.request.type !== "IntentRequest") {
            throw Error("Adding slot to non-intentName request - not allowed!");
        }
        this.requestJSON.request.intent.slots[slotName] = { "name": slotName, "value": slotValue };
        return this;
    }

    public launchRequest(): any {
        this.requestJSON = this.generateRequest(RequestType.LaunchRequest, null);
        return this;
    }

    public sessionEndedRequest(reason: SessionEndedReason): any {
        this.requestJSON = this.generateRequest(RequestType.SessionEndedRequest, null, reason);
        return this;
    }

    private generateRequest(requestType: RequestType, intentName?: string, reason?: SessionEndedReason): any {
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
        } else if (requestType === RequestType.LaunchRequest) {
            request.request = ServiceRequest.generateLaunchRequest();
        } else if (requestType === RequestType.SessionEndedRequest) {
            request.request = ServiceRequest.generateSessionEndedRequest(reason);
        }

        this.newSession = false;
        return request;
    }

    private static generateIntentRequest(intentName: string): any {
        let requestID = ServiceRequest.requestID();
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

    private static generateLaunchRequest(): any {
        let requestID = ServiceRequest.requestID();
        let timestamp = ServiceRequest.timestamp();
        return {
            "type": "LaunchRequest",
            "requestId": requestID,
            "timestamp": timestamp
        };
    }

    private static generateSessionEndedRequest(reason: SessionEndedReason): any {
        let requestID = ServiceRequest.requestID();
        let timestamp = ServiceRequest.timestamp();
        let reasonString = SessionEndedReason[reason];

        return {
            "type": "SessionEndedRequest",
            "requestId": requestID,
            "timestamp": timestamp,
            "reason": reasonString
        };
    }

    /**
     * The timestamp is a normal JS timestamp without the milliseconds
     */
    private static timestamp() {
        let timestamp = new Date().toISOString();
        return timestamp.substring(0, 19) + "Z";
    }

    private static requestID() {
        return "EdwRequestId." + uuid.v4();
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