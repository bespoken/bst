"use strict";
var node_manager_1 = require("./node-manager");
var webhook_manager_1 = require("./webhook-manager");
var BespokeServer = (function () {
    function BespokeServer(webhookPort, nodePort) {
        this.webhookPort = webhookPort;
        this.nodePort = nodePort;
    }
    BespokeServer.prototype.start = function () {
        var self = this;
        this.nodeManager = new node_manager_1.NodeManager(this.nodePort);
        this.nodeManager.start();
        this.webhookManager = new webhook_manager_1.WebhookManager(this.webhookPort);
        this.webhookManager.start();
        this.webhookManager.onWebhookReceived = function (socket, webhookRequest) {
            // Lookup the node
            var node = self.nodeManager.node(webhookRequest.nodeID());
            if (node == null) {
                console.log("Ignoring this webhook - no matching node");
            }
            else {
                node.forward(socket, webhookRequest);
            }
        };
    };
    BespokeServer.prototype.stop = function (callback) {
        this.nodeManager.stop(callback);
        this.webhookManager.stop();
    };
    return BespokeServer;
}());
exports.BespokeServer = BespokeServer;
