import {AlexaSession} from "./alexa-session";
const uuid = require("node-uuid");

export class RequestType {
    public static IntentRequest = "IntentRequest";
    public static LaunchRequest = "LaunchRequest";
    public static SessionEndedRequest = "SessionEndedRequest";
    public static AudioPlayerPlaybackNearlyFinished = "AudioPlayer.PlaybackStarted";
    public static AudioPlayerPlaybackStarted = "AudioPlayer.PlaybackStarted";
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
    private requestJSON: any = null;

    public constructor (private session: AlexaSession) {}

    /**
     * Generates an intentName request with the specified IntentName
     * @param intentName
     * @returns {ServiceRequest}
     */
    public intentRequest(intentName: string): ServiceRequest {
        if (!this.session.interactionModel.hasIntent(intentName)) {
            throw new Error("Interaction model has no intentName named: " + intentName);
        }

        this.requestJSON = this.baseRequest(RequestType.IntentRequest);
        this.requestJSON.request.intent = {
            name: intentName,
            slots: {}
        };

        return this;
    }

    public playbackStarted(): ServiceRequest {
        this.requestJSON = this.baseRequest(RequestType.AudioPlayerPlaybackStarted);
        return this;
    }

    public playbackNearlyFinished(token: string, offsetInMilliseconds: number): ServiceRequest {
        this.requestJSON = this.baseRequest(RequestType.AudioPlayerPlaybackNearlyFinished);
        this.requestJSON.request.token = token;
        this.requestJSON.request.offsetInMilliseconds = offsetInMilliseconds;
        return this;
    }

    public launchRequest(): ServiceRequest {
        this.requestJSON = this.baseRequest(RequestType.LaunchRequest);
        return this;
    }

    public sessionEndedRequest(reason: SessionEndedReason): ServiceRequest {
        this.requestJSON = this.baseRequest(RequestType.SessionEndedRequest);
        this.requestJSON.request.reason = SessionEndedReason[reason];
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

    private baseRequest(requestType: string): any {
        let applicationID = this.session.applicationID();
        let newSession = this.session.isNew();
        let requestID = ServiceRequest.requestID();
        let sessionID = this.session.id();
        let timestamp = ServiceRequest.timestamp();
        let userID = this.session.userID();

        // First create the header part of the request
        let request = {
            "request": {
                "type": requestType,
                "locale": "en-US",
                "requestID": requestID,
                "timestamp": timestamp
            },
            "session": {
                "sessionId": sessionID,
                "application": {
                    "applicationId": applicationID
                },
                "attributes": {},
                "user": {
                    "userId": userID
                },
                "new": newSession
            },
            "version": "1.0"
        };

        this.session.used();
        return request;
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
}