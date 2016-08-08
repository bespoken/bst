import {NodeManager} from "./node-manager";
import {WebhookManager} from "./webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {Socket} from "net";
import {HTTPHelper} from "../core/http-helper";

export class BespokeServer {
    private nodeManager: NodeManager;
    private webhookManager: WebhookManager;

    public constructor (private webhookPort: number, private nodePort: number) {}

    public start (): void {
        let self = this;

        this.nodeManager = new NodeManager(this.nodePort);
        this.nodeManager.start();

        this.webhookManager = new WebhookManager(this.webhookPort);
        this.webhookManager.start();
        this.webhookManager.onWebhookReceived = function(socket: Socket, webhookRequest: WebhookRequest) {
            // Check if this is a ping
            if (webhookRequest.isPing()) {
                HTTPHelper.respond(socket, 200, "bst-server");

            } else {
                if (webhookRequest.nodeID() === null) {
                    HTTPHelper.respond(socket, 400, "No node specified. Must be included with the querystring as node-id.");
                } else {
                    // Lookup the node
                    let node = self.nodeManager.node(webhookRequest.nodeID());
                    if (node == null) {
                        HTTPHelper.respond(socket, 404, "Node is not active: " + webhookRequest.nodeID() + ".");
                    } else {
                        node.forward(socket, webhookRequest);
                    }
                }
            }
        };
    }

    public stop(callback: () => void): void {
        // Use a counter to see that both callbacks have completed
        // The beauty of Node - use non-synchronized counter variables like this safely :-)
        let count = 0;
        let callbackFunction = function () {
            count++;
            if (count === 2) {
                callback();
            }
        };
        this.nodeManager.stop(callbackFunction);
        this.webhookManager.stop(callbackFunction);
    }

}
