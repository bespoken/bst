import {NodeManager} from "./node-manager";
import {WebhookManager} from "./webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {HTTPHelper} from "../core/http-helper";
import {Global} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";
import {BstStatistics, BstCommand, BstEvent} from "../statistics/bst-statistics";
const Logger = "BSPKD";

export class BespokeServer {
    private nodeManager: NodeManager;
    private webhookManager: WebhookManager;
    private uncaughtExceptionHandler: (err: Error) => void;

    public constructor (private webhookPort: number, private nodePort: number) {}

    public start (started?: () => void): void {
        BstStatistics.instance().start();
        let self = this;
        console.error("AWS_KEY: " + process.env["AWS_ACCESS_KEY_ID"]);

        let count = 0;
        // Make sure both NodeManager and WebhookManager have started
        let callbackCounter = function () {
            count++;
            if (count === 2) {
                if (started !== undefined && started !== null) {
                    started();
                }
            }
        };

        this.nodeManager = new NodeManager(this.nodePort);
        this.nodeManager.start(callbackCounter);

        this.webhookManager = new WebhookManager(this.webhookPort);
        this.webhookManager.start(callbackCounter);
        this.webhookManager.onWebhookReceived = function(webhookRequest: WebhookRequest) {
            // Check if this is a ping
            if (webhookRequest.isPing()) {
                HTTPHelper.respond(webhookRequest.sourceSocket, 200, "bst-server-" + Global.version());

            } else {
                try {
                    webhookRequest.nodeID();
                } catch (error) {
                    HTTPHelper.respond(webhookRequest.sourceSocket, 400, error.message);
                    BstStatistics.instance().record(BstCommand.proxy, BstEvent.dropped);
                    return;
                }

                if (webhookRequest.nodeID() === null) {
                    LoggingHelper.error(Logger, "No node specified: " + webhookRequest.uri);

                    HTTPHelper.respond(webhookRequest.sourceSocket, 400, "No node specified. Must be included with the querystring as node-id.");
                } else {
                    // Lookup the node
                    let node = self.nodeManager.node(webhookRequest.nodeID());


                    if (node == null) {
                        LoggingHelper.error(Logger, "Node is not active: " + webhookRequest.nodeID());
                        HTTPHelper.respond(webhookRequest.sourceSocket, 404, "Node is not active: " + webhookRequest.nodeID());

                        // Capture the request was not forwarded
                        BstStatistics.instance().record(BstCommand.proxy, BstEvent.dropped, webhookRequest.nodeID());
                    } else {
                        LoggingHelper.info(Logger, "Forwarded: " + webhookRequest.nodeID());
                        node.forward(webhookRequest);

                        // Capture the request was forwarded
                        BstStatistics.instance().record(BstCommand.proxy, BstEvent.forwarded, node.id);
                    }
                }
            }
        };

        this.uncaughtExceptionHandler = function(error: Error) {
            console.error("UncaughtException: " + error.stack);
        };

        process.on("uncaughtException", this.uncaughtExceptionHandler);
    }

    public stop(callback: () => void): void {
        BstStatistics.instance().stop();
        // Use a counter to see that both callbacks have completed
        // The beauty of Node - use non-synchronized counter variables like this safely :-)
        let count = 0;
        let callbackFunction = function () {
            count++;
            if (count === 2) {
                callback();
            }
        };

        process.removeListener("uncaughtException", this.uncaughtExceptionHandler);
        this.nodeManager.stop(callbackFunction);
        this.webhookManager.stop(callbackFunction);
    }

}
