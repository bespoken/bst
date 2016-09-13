import {AudioPlayer} from "./audio-player";
import {LoggingHelper} from "../core/logging-helper";
import {ServiceRequest} from "./service-request";
import {AlexaSession} from "./alexa-session";
import request = require("request");
import http = require("http");
import {InteractionModel} from "./interaction-model";
import {AlexaContext} from "./alexa-context";
import {EventEmitter} from "events";
const Logger = "ALEXA";

export interface AlexaResponseCallback {
    (request: any, response: any, error?: string): void;
}

export enum AlexaEvent {
    SessionEnded,
    SkillError,
    SkillResponse
}

export class Alexa {
    private _audioPlayer: AudioPlayer = null;
    private _context: AlexaContext = null;
    private _session: AlexaSession = null;
    private _emitter: EventEmitter = null;

    public constructor() {
        this._audioPlayer = new AudioPlayer(this);
        this._emitter = new EventEmitter();
    }

    /**
     * Must be called before sending any session-based requests
     */
    public startSession(skillURL: string, model: InteractionModel, audioEnabled: boolean, applicationID?: string): Alexa {
        // The context is like a session but can live beyond it (if it supports audio)
        this._context = new AlexaContext(skillURL, applicationID);
        this._session = new AlexaSession(model);
        if (audioEnabled) {
            this._audioPlayer = new AudioPlayer(this);
        }
        return this;
    }

    public session(): AlexaSession {
        return this._session;
    }

    public endSession(): void {
        this._session = null;
    }

    public activeSession(): boolean {
        return this._session !== null;
    }

    public context(): AlexaContext {
        return this._context;
    }

    public onSkillResponse(callback: (skillRequestJSON: any, skillResponseJSON: any) => void) {
        this._emitter.on(AlexaEvent[AlexaEvent.SkillResponse], callback);
    }

    /**
     * Calls the skill with specified phrase
     * Hits the callback with the JSON payload from the response
     * @param utterance
     * @param callback
     */
    public spoken(utterance: string, callback: AlexaResponseCallback): any {
        if (!this.activeSession()) {
            throw Error("Session must be started before calling spoken");
        }

        let intent = this._session.interactionModel.sampleUtterances.intentForUtterance(utterance);

        // If we don't match anything, we use the default utterance - simple algorithm for this
        if (intent === null) {
            let defaultUtterance = this._session.interactionModel.sampleUtterances.defaultUtterance();
            intent = this._session.interactionModel.sampleUtterances.intentForUtterance(defaultUtterance);
            LoggingHelper.warn(Logger, "No intentName matches utterance: " + utterance + ". Using fallback utterance: " + intent.utterance);
        }

        try {
            let serviceRequest = new ServiceRequest(this._context, this._session).intentRequest(intent.intentName);
            for (let i = 0; i < intent.slotCount(); i++) {
                serviceRequest.withSlot(intent.slotName(i), intent.slotValue(i));
            }
            let requestJSON = serviceRequest.toJSON();

            this.callSkill(requestJSON, callback);
        } catch (e) {
            callback(null, null, e.message);
        }
    }

    public callSkill(requestJSON: any, callback: AlexaResponseCallback) {
        let self = this;
        let responseHandler = function(error: any, response: http.IncomingMessage, body: any) {
            if (error) {
                callback(null, null, error.message);
            } else {
                // Check if there are any audio directives when it comes back
                if (body.response !== undefined && body.response.directives !== undefined) {
                    self._audioPlayer.directivesReceived(request, body.response.directives);
                }
                callback(requestJSON, body);

                self._emitter.emit(AlexaEvent[AlexaEvent.SkillResponse], requestJSON, body);

                // After a successful call, set the session to used (no longer new)
                if (self.activeSession()) {
                    self.session().used();
                }
            }
        };

        try {
            request.post({
                url: this._context.skillURL,
                method: "POST",
                json: requestJSON,
            }, responseHandler);
        } catch (e) {
            callback(null, null, e.message);
        }
    }
}