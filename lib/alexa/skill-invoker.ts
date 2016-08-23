import {InteractionModel} from "./interaction-model";
import {ServiceRequest} from "./service-request";
import * as request from "request";
import * as http from "http";
import {LoggingHelper} from "../core/logging-helper";
import {UtteredIntent} from "./sample-utterances";

const Logger = "INVOKER";

export class SkillInvoker {
    public serviceRequest: ServiceRequest;
    public constructor(public skillURL: string, public interactionModel: InteractionModel, public applicationID?: string) {
        this.serviceRequest = new ServiceRequest(interactionModel, applicationID);
    }

    /**
     * Calls the skill with specified phrase
     * Hits the callback with the JSON payload from the response
     * @param utterance
     * @param callback
     */
    public say(utterance: string, callback: (request: any, response: any, error?: string) => void): any {
        let intent: UtteredIntent = this.interactionModel.sampleUtterances.intentForUtterance(utterance);

        // If we don't match anything, we use the default utterance - simple algorithm for this
        if (intent === null) {
            let defaultUtterance = this.interactionModel.sampleUtterances.defaultUtterance();
            intent = this.interactionModel.sampleUtterances.intentForUtterance(defaultUtterance);
            LoggingHelper.warn(Logger, "No intentName matches utterance: " + utterance + ". Using fallback utterance: " + intent.utterance);
        }

        try {
            this.serviceRequest.intentRequest(intent.intentName);
            for (let i = 0; i < intent.slotCount(); i++) {
                this.serviceRequest.withSlot(intent.slotName(i), intent.slotValue(i));
            }
            let requestJSON = this.serviceRequest.toJSON();

            let responseHandler = function(error: any, response: http.IncomingMessage, body: any) {
                if (error) {
                    callback(null, null, error.message);
                } else {
                    callback(requestJSON, body);
                }
            };

            request.post({
                url: this.skillURL,
                method: "POST",
                json: requestJSON,
            }, responseHandler);
        } catch (e) {
            callback(null, null, e.message);
        }
    }
}
