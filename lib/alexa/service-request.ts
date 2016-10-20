import {AlexaContext} from "./alexa-context";
import {AudioPlayerActivity} from "./audio-player";
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
    private requestType: string;
    public constructor (private context: AlexaContext) {}

    /**
     * Generates an intentName request with the specified IntentName
     * @param intentName
     * @returns {ServiceRequest}
     */
    public intentRequest(intentName: string): ServiceRequest {
        let isBuiltin = intentName.startsWith("AMAZON");
        if (!isBuiltin) {
            if (!this.context.interactionModel().hasIntent(intentName)) {
                throw new Error("Interaction model has no intentName named: " + intentName);
            }
        }

        this.requestJSON = this.baseRequest(RequestType.IntentRequest);
        this.requestJSON.request.intent = {
            name: intentName
        };

        // Always specify slots, even if utterance does not come with them specified
        //  In that case, they just have a blank value
        if (!isBuiltin) {
            let intent = this.context.interactionModel().intentSchema.intent(intentName);
            if (intent.slots !== null && intent.slots.length > 0) {
                this.requestJSON.request.intent.slots = {};
                for (let slot of intent.slots) {
                    this.requestJSON.request.intent.slots[slot.name] = {
                        name: slot.name
                    };
                }
            }
        }

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

    public requiresSession(): boolean {
        let requireSession = false;
        // LaunchRequests and IntentRequests both create a new session
        //  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#play-directive
        if (this.requestType === RequestType.LaunchRequest || this.requestType === RequestType.IntentRequest) {
            requireSession = true;
        }
        return requireSession;
    }

    private baseRequest(requestType: string): any {
        this.requestType = requestType;
        const applicationID = this.context.applicationID();
        const requestID = ServiceRequest.requestID();
        const userID = this.context.userID();
        const timestamp = ServiceRequest.timestamp();

        // First create the header part of the request
        return {
            request: {
                type: requestType,
                locale: "en-US",
                requestId: requestID,
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
    }

    /**
     * The timestamp is a normal JS timestamp without the milliseconds
     */
    private static timestamp() {
        let timestamp = new Date().toISOString();
        return timestamp.substring(0, 19) + "Z";
    }

    private static requestID() {
        return "amzn1.echo-api.request." + uuid.v4();
    }

    /**
     * Whether this request should include a session
     * "Core" request types do, AudioPlayer ones do not
     * @returns {boolean}
     */
    private includeSession(): boolean {
        let include = false;
        if (this.requestType === RequestType.IntentRequest ||
            this.requestType === RequestType.LaunchRequest ||
            this.requestType === RequestType.SessionEndedRequest) {
            include = true;
        }
        return include;
    }

    public toJSON() {
        const applicationID = this.context.applicationID();
        const userID = this.context.userID();

        // If we have a session, set the info
        if (this.includeSession() && this.context.activeSession()) {
            const session = this.context.session();
            let newSession = session.isNew();
            let sessionID = session.id();
            let attributes = session.attributes();

            this.requestJSON.session = {
                sessionId: sessionID,
                application: {
                    applicationId: applicationID
                },
                user: {
                    userId: userID
                },
                "new": newSession
            };

            if (this.requestType !== RequestType.LaunchRequest) {
                this.requestJSON.session.attributes = attributes;
            }
        }

        // For intent, launch and session ended requests, send the audio player state if there is one
        if (this.requestType === RequestType.IntentRequest
            || this.requestType === RequestType.LaunchRequest
            || this.requestType === RequestType.SessionEndedRequest) {
            if (this.context.audioPlayerEnabled()) {
                const activity = AudioPlayerActivity[this.context.audioPlayer().activity()];
                this.requestJSON.context.AudioPlayer = {
                    playerActivity: activity
                };

                // Anything other than IDLE, we send token and offset
                if (this.context.audioPlayer().activity() !== AudioPlayerActivity.IDLE) {
                    const playing = this.context.audioPlayer().playing();
                    this.requestJSON.context.AudioPlayer.token = playing.stream.token;
                    this.requestJSON.context.AudioPlayer.offsetInMilliseconds = playing.stream.offsetInMilliseconds;
                }
            }
        }

        return this.requestJSON;
    }
}