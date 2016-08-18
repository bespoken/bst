import {InteractionModel} from "./interaction-model";
import {ServiceRequest} from "./service-request";
import * as request from "request";
import * as http from "http";
import {LoggingHelper} from "../core/logging-helper";

const Logger = "INVOKER";

export class SkillInvoker {
    public serviceRequest: ServiceRequest;
    public constructor(public skillURL: string, public interactionModel: InteractionModel, public applicationID?: string) {
        this.serviceRequest = new ServiceRequest(interactionModel, applicationID);
    }

    /**
     * Calls the skill with specified phrase
     * Hits the callback with the JSON payload from the response
     * @param phrase
     * @param callback
     */
    public say(phrase: string, callback: (response: any, error?: string) => void): any {
        let intent = this.interactionModel.sampleUtterances.intentForPhrase(phrase);
        if (intent === null) {
            // Just grab the first intent for now
            intent = this.interactionModel.intentSchema.intents()[0].name;
            LoggingHelper.warn(Logger, "No intent matches phrase: " + phrase + ". Using fallback intent: " + intent);
        }

        try {
            let requestJSON = this.serviceRequest.intentRequest(intent);
            let responseHandler = function(error: any, response: http.IncomingMessage, body: any) {
                if (error) {
                    callback(null, error.message);
                } else {
                    callback(body);
                }
            };

            request.post({
                url: this.skillURL,
                method: "POST",
                json: requestJSON,
            }, responseHandler);
        } catch (e) {
            callback(null, e.message);
        }
    }
}
