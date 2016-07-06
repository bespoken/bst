"use strict";
var webhook_request_1 = require("./webhook-request");
var net = require("net");
var WebhookManager = (function () {
    function WebhookManager(port) {
        this.port = port;
        this.onWebhookReceived = null;
        this.host = "0.0.0.0";
    }
    WebhookManager.prototype.start = function () {
        var self = this;
        this.server = net.createServer(function (socket) {
            var message = "";
            socket.on('data', function (data) {
                console.log('Webhook DATA ' + socket.remoteAddress);
                var webhookRequest = new webhook_request_1.WebhookRequest();
                webhookRequest.append(data);
                if (webhookRequest.done()) {
                    self.onWebhookReceived(webhookRequest);
                }
            });
            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        }).listen(this.port, this.host);
    };
    return WebhookManager;
}());
exports.WebhookManager = WebhookManager;
