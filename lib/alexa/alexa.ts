import {AudioPlayer} from "./audio-player";
import {LoggingHelper} from "../core/logging-helper";
import {ServiceRequest} from "./service-request";
import {AlexaSession} from "./alexa-session";
import request = require("request");
import http = require("http");
import {InteractionModel} from "./interaction-model";
import {AlexaContext} from "./alexa-context";
import {EventEmitter} from "events";
import {RequestCallback} from "request";
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
    // Until we have a better approach, we sequence the calls
    private _actionQueue: ActionQueue = new ActionQueue();
    private _context: AlexaContext = null;
    private _session: AlexaSession = null;
    private _emitter: EventEmitter = null;

    public constructor() {
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

    /**
     * Calls the skill with specified phrase
     * Hits the callback with the JSON payload from the response
     * @param utterance
     * @param callback
     */
    public spoken(utterance: string, callback: AlexaResponseCallback): void {
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

        this.callSkillWithIntent(intent.intentName, intent.toJSON(), callback);
    }

    /**
     * Passes in an intent with slots as a simple JSON map: {slot1: "value", slot2: "value2", etc.}
     * @param intentName
     * @param slots
     * @param callback
     */
    public intended(intentName: string, slots: any, callback: AlexaResponseCallback): void {
        // We validate the intents that don't start with Amazon
        //  Otherwise we just pass it through
        if (!intentName.startsWith("AMAZON")) {
            if (!this.activeSession()) {
                throw Error("No active session - cannot send custom intent");
            } else if (!this._session.interactionModel.hasIntent(intentName)) {
                throw Error("Intent does not exist: " + intentName);
            }
        }

        this.callSkillWithIntent(intentName, slots, callback);
    }

    private callSkillWithIntent(intentName: string, slots: any, callback: AlexaResponseCallback): void {
        let self = this;
        try {
            let serviceRequest = new ServiceRequest(this._context, this._session).intentRequest(intentName);
            if (slots !== undefined && slots !== null) {
                for (let slotName of Object.keys(slots)) {
                    serviceRequest.withSlot(slotName, slots[slotName]);
                }
            }
            let requestJSON = serviceRequest.toJSON();

            // When the user utters an intent, we suspend for it
            if (this._audioPlayer.isPlaying()) {
                this._audioPlayer.suspend();
            }
            this.callSkill(requestJSON, function (requestJSON: any, responseJSON: any, error?: string) {
                callback(requestJSON, responseJSON, error);
                if (self._audioPlayer.suspended()) {
                    self._audioPlayer.resume();
                }
            });
        } catch (e) {
            callback(null, null, e.message);
        }
    }

    public callSkill(requestJSON: any, callback?: AlexaResponseCallback): void {
        let self = this;
        this.sequence(function (done) {
            self.callSkillImpl(requestJSON, callback, done);
        });
    }

    public sequence(action: AlexaAction) {
        this._actionQueue.enqueue(action);
    }

    private callSkillImpl(requestJSON: any, callback: AlexaResponseCallback, done: Function) {
        let self = this;
        LoggingHelper.info(Logger, "CALLING: " + requestJSON.request.type);

        let responseHandler = function(error: any, response: http.IncomingMessage, body: any) {
            // After a call, set the session to used (no longer new)
            if (self.activeSession()) {
                self.session().used();
                if (!error) {
                    if (body.response.shouldEndSession) {
                        self.endSession();
                    } else {
                        self.session().updateAttributes(body.sessionAttributes);
                    }
                }
            }

            if (error) {
                if (callback !== undefined && callback !== null) {
                    callback(null, null, error.message);
                }
            } else {
                // Check if there are any audio directives when it comes back
                if (body.response !== undefined && body.response.directives !== undefined) {
                    self._audioPlayer.directivesReceived(requestJSON, body.response.directives);
                }

                if (callback !== undefined && callback !== null) {
                    callback(requestJSON, body);
                }

                self._emitter.emit(AlexaEvent[AlexaEvent.SkillResponse], requestJSON, body);
            }

            done();
        };

        try {
            this.post({
                url: this._context.skillURL,
                method: "POST",
                json: requestJSON,
            }, responseHandler);
        } catch (e) {
            LoggingHelper.error(Logger, e.message);
            if (callback !== undefined && callback !== null) {
                callback(null, null, e.message);
            }
        }
    }

    /**
     * This is its own method for mocking
     * @param options
     * @param responseHandler
     */
    protected post(options: any, responseHandler: RequestCallback) {
        request.post(options, responseHandler);
    }

    public onSkillResponse(callback: (skillRequestJSON: any, skillResponseJSON: any) => void) {
        this._emitter.on(AlexaEvent[AlexaEvent.SkillResponse], callback);
    }

    public shutdown(onShutdown: () => void) {
        // Wait until the current call finishes if the queue > 0 - otherwise, call complete now
        this._actionQueue.stop(function () {
            onShutdown();
        });
    }
}

export interface AlexaAction {
    (done: Function): void;
}

export class ActionQueue {
    private _queue: Array<AlexaAction> = [];
    private _stop: boolean = false;
    private _stopCallback: Function;

    public enqueue(action: AlexaAction): void {
        this._queue.push(action);
        if (this._queue.length === 1) {
            this.next();
        }
    }

    public processing(): boolean {
        return (this._queue.length > 0);
    }

    public next() {
        let self = this;
        if (this._queue.length === 0) {
            return;
        }

        let action = this._queue[0];
        action(function () {
            self._queue = self._queue.slice(1);
            if (self._stop) {
                self._stopCallback();
            } else {
                self.next();
            }
        });
    }

    public stop(onStop: Function) {
        this._stop = true;
        if (this.processing()) {
            this._stopCallback = onStop;
        } else {
            onStop();
        }
    }
}