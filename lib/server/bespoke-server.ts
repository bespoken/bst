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

    public constructor (private webhookPort: number, private nodePorts: number[]) {}

    public async start (): Promise<void> {
        BstStatistics.instance().start();
        let self = this;
        console.error("AWS_KEY: " + process.env["AWS_ACCESS_KEY_ID"]);

        this.nodeManager = new NodeManager(this.nodePorts);
        await this.nodeManager.start();

        this.webhookManager = new WebhookManager(this.webhookPort);
        await this.webhookManager.start();

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
        process.on("unhandledRejection", this.uncaughtExceptionHandler);
    }

    public async stop(): Promise<void> {
        BstStatistics.instance().stop();

        LoggingHelper.info(Logger, "BespkoenServer STOP");
        process.removeListener("uncaughtException", this.uncaughtExceptionHandler);
        process.removeListener("unhandledRejection", this.uncaughtExceptionHandler);
        await this.nodeManager.stop();
        await this.webhookManager.stop();
    }

}
