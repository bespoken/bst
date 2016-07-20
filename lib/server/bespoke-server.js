"use strict";
const node_manager_1 = require("./node-manager");
const webhook_manager_1 = require("./webhook-manager");
const http_helper_1 = require("../core/http-helper");
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
            if (webhookRequest.isPing()) {
                http_helper_1.HTTPHelper.respond(socket, 200, "bst-server");
            }
            else {
                if (webhookRequest.nodeID() === null) {
                    http_helper_1.HTTPHelper.respond(socket, 400, "No node specified. Must be included with the querystring as node-id.");
                }
                else {
                    let node = self.nodeManager.node(webhookRequest.nodeID());
                    if (node == null) {
                        http_helper_1.HTTPHelper.respond(socket, 404, "Node is not active: " + webhookRequest.nodeID() + ".");
                    }
                    else {
                        node.forward(socket, webhookRequest);
                    }
                }
            }
        };
    }
    stop(callback) {
        this.nodeManager.stop(callback);
        this.webhookManager.stop();
    }
}
exports.BespokeServer = BespokeServer;
//# sourceMappingURL=bespoke-server.js.map