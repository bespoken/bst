"use strict";
var webhook_request_1 = require("./webhook-request");
var net = require("net");
var buffer_util_1 = require("../core/buffer-util");
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
                var dataString = data.toString();
                if (dataString.length > 4 && dataString.substr(0, 3) != "GET") {
                    console.log('Webhook From ' + socket.remoteAddress + ":" + socket.remotePort);
                    console.log('Webhook Payload ' + buffer_util_1.BufferUtil.prettyPrint(data));
                }
                var webhookRequest = new webhook_request_1.WebhookRequest();
                webhookRequest.append(data);
                if (webhookRequest.done()) {
                    if (webhookRequest.isPing()) {
                        socket.write("HTTP/1.0 200 OK\r\nContent-Length: 10\r\n\r\nbst-server");
                        socket.end();
                    }
                    else {
                        self.onWebhookReceived(socket, webhookRequest);
                    }
                }
            });
        }).listen(this.port, this.host);
        console.log('WebhookServer listening on ' + this.host + ':' + this.port);
    };
    return WebhookManager;
}());
exports.WebhookManager = WebhookManager;
//# sourceMappingURL=webhook-manager.js.map