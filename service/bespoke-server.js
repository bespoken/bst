"use strict";
var node_manager_1 = require("./node-manager");
var webhook_manager_1 = require("./webhook-manager");
var BespokeServer = (function () {
    function BespokeServer(webhookPort, nodePort) {
        this.webhookPort = webhookPort;
        this.nodePort = nodePort;
    }
    BespokeServer.prototype.start = function () {
        this.nodeManager = new node_manager_1.NodeManager(this.nodePort);
        this.nodeManager.start();
        this.webhookManager = new webhook_manager_1.WebhookManager(this.webhookPort);
        this.webhookManager.start();
    };
    return BespokeServer;
}());
exports.BespokeServer = BespokeServer;
