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
            socket.on('data', function (data) {
                //Throw away the pings - too much noise
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
            // We have a connection - a socket object is assigned to the connection automatically
            //console.log('WEBHOOK CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        }).listen(this.port, this.host);
        console.log('WebhookServer listening on ' + this.host + ':' + this.port);
    };
    WebhookManager.prototype.stop = function () {
        this.server.close(function () {
            console.log("WebhookManager STOP");
        });
    };
    return WebhookManager;
}());
exports.WebhookManager = WebhookManager;
