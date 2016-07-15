import {NodeManager} from "./node-manager";
import {WebhookManager} from "./webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {Socket} from "net";

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
            // Lookup the node
            let node = self.nodeManager.node(webhookRequest.nodeID());
            if (node == null) {
                console.log("Ignoring this webhook - no matching node");
            } else {
                node.forward(socket, webhookRequest);
            }
        };
    }

    public stop(callback: () => void): void {
        this.nodeManager.stop(callback);
        this.webhookManager.stop();
    }

}
