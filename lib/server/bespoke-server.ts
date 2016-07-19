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
                self.respond(socket, HTTPHelper.response(200, "bst-server"));

            } else {
                if (webhookRequest.nodeID() === null) {
                    self.respond(socket, HTTPHelper.response(404, "No node specified with the querystring: node-id"));
                } else {
                    // Lookup the node
                    let node = self.nodeManager.node(webhookRequest.nodeID());
                    if (node == null) {
                        self.respond(socket, HTTPHelper.response(404, "Node is not active: " + webhookRequest.nodeID()));
                    } else {
                        node.forward(socket, webhookRequest);
                    }
                }
            }
        };
    }

    /**
     * Sends the HTTP response payload through the socket and closes it
     * @param socket
     * @param payload
     */
    private respond(socket: Socket, payload: string) {
        socket.write(payload);
        socket.end();
    }

    public stop(callback: () => void): void {
        this.nodeManager.stop(callback);
        this.webhookManager.stop();
    }

}
