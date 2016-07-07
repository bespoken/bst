"use strict";
const node_manager_1 = require("./node-manager");
const webhook_manager_1 = require("./webhook-manager");
class BespokeServer {
    constructor(webhookPort, nodePort) {
        this.webhookPort = webhookPort;
        this.nodePort = nodePort;
    }
    start() {
        let self = this;
        this.nodeManager = new node_manager_1.NodeManager(this.nodePort);
        this.nodeManager.start();
        this.webhookManager = new webhook_manager_1.WebhookManager(this.webhookPort);
        this.webhookManager.start();
        this.webhookManager.onWebhookReceived = function (socket, webhookRequest) {
            let node = self.nodeManager.node(webhookRequest.nodeID());
            if (node == null) {
                console.log("Ignoring this webhook - no matching node");
            }
            else {
                node.forward(socket, webhookRequest);
            }
        };
    }
}
exports.BespokeServer = BespokeServer;
//# sourceMappingURL=bespoke-server.js.map