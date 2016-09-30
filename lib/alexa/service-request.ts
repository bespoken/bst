import {AlexaSession} from "./alexa-session";
import {AlexaContext} from "./alexa-context";
import {AudioPlayerState} from "./audio-player";
const uuid = require("node-uuid");

export class RequestType {
    public static IntentRequest = "IntentRequest";
    public static LaunchRequest = "LaunchRequest";
    public static SessionEndedRequest = "SessionEndedRequest";
    public static AudioPlayerPlaybackFinished = "AudioPlayer.PlaybackFinished";
    public static AudioPlayerPlaybackNearlyFinished = "AudioPlayer.PlaybackNearlyFinished";
    public static AudioPlayerPlaybackStarted = "AudioPlayer.PlaybackStarted";
    public static AudioPlayerPlaybackStopped = "AudioPlayer.PlaybackStopped";
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

    public constructor (private context: AlexaContext, private session?: AlexaSession) {}

    /**
     * Generates an intentName request with the specified IntentName
     * @param intentName
     * @returns {ServiceRequest}
     */
    public intentRequest(intentName: string): ServiceRequest {
        if (!intentName.startsWith("AMAZON")) {
            if (this.session === undefined || this.session === null) {
                throw new Error("No session - cannot pass custom intent when not in session");
            } else if (!this.session.interactionModel.hasIntent(intentName)) {
                throw new Error("Interaction model has no intentName named: " + intentName);
            }
        }

        this.requestJSON = this.baseRequest(RequestType.IntentRequest);
        this.requestJSON.request.intent = {
            name: intentName
        };

        
        return this;
    }

    public audioPlayerRequest(requestType: string, token: string, offsetInMilliseconds: number): ServiceRequest {
        this.requestJSON = this.baseRequest(requestType);
        this.requestJSON.request.token = token;
        this.requestJSON.request.offsetInMilliseconds = offsetInMilliseconds;
        return this;
    }

    public launchRequest(): ServiceRequest {
        this.requestJSON = this.baseRequest(RequestType.LaunchRequest);
        return this;
    }

    public sessionEndedRequest(reason: SessionEndedReason, errorData?: any): ServiceRequest {
        this.requestJSON = this.baseRequest(RequestType.SessionEndedRequest);
        this.requestJSON.request.reason = SessionEndedReason[reason];
        if (errorData !== undefined && errorData !== null) {
            this.requestJSON.request.error = errorData;
        }
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
        let applicationID = this.context.applicationID();
        let requestID = ServiceRequest.requestID();
        let timestamp = ServiceRequest.timestamp();
        let userID = this.context.userID();

        // First create the header part of the request
        let request: any = {
            request: {
                type: requestType,
                locale: "en-US",
                requestID: requestID,
                timestamp: timestamp
            },
            context: {
                System: {
                    application: {
                        applicationId: applicationID
                    },
                    device: {
                        supportedInterfaces: {
                            AudioPlayer: {}
                        }
                    },
                    user: {
                        userId: userID
                    },
                }
            },
            version: "1.0"
        };

        // If we have a session, set the info
        if (this.session !== undefined && this.session !== null) {
            let newSession = this.session.isNew();
            let sessionID = this.session.id();
            let attributes = this.session.attributes();

            request.session = {
                sessionId: sessionID,
                application: {
                    applicationId: applicationID
                },
                attributes: attributes,
                user: {
                    userId: userID
                },
                "new": newSession
            };
        }

        // For intent, launch and session ended requests, send the audio player state if there is one
        if (requestType === RequestType.IntentRequest
            || requestType === RequestType.LaunchRequest
            || requestType === RequestType.SessionEndedRequest) {
            if (this.context.audioPlayerEnabled()) {
                let offset = this.context.audioPlayer().offsetInMilliseconds();
                let token = this.context.audioPlayer().token();

                let state = this.context.audioPlayer().state();
                let activity: string = null;

                if (state === AudioPlayerState.PlaybackFinished) {
                    activity = "FINISHED";
                } else if (state === AudioPlayerState.PlaybackStopped) {
                    activity = "STOPPED";
                }

                request.context.AudioPlayer = {
                    offsetInMilliseconds: offset,
                    token: token,
                    playerActivity: activity
                };
            }
        }

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