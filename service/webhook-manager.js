"use strict";
const webhook_request_1 = require("./webhook-request");
const net = require("net");
const buffer_util_1 = require("../core/buffer-util");
class WebhookManager {
    constructor(port) {
        this.port = port;
        this.onWebhookReceived = null;
        this.host = "0.0.0.0";
    }
    start() {
        let self = this;
        this.server = net.createServer(function (socket) {
            socket.on('data', function (data) {
                let dataString = data.toString();
                if (dataString.length > 4 && dataString.substr(0, 3) != "GET") {
                    console.log('Webhook From ' + socket.remoteAddress + ":" + socket.remotePort);
                    console.log('Webhook Payload ' + buffer_util_1.BufferUtil.prettyPrint(data));
                }
                let webhookRequest = new webhook_request_1.WebhookRequest();
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
    }
    stop() {
        this.server.close(function () {
            console.log("WebhookManager STOP");
        });
    }
}
exports.WebhookManager = WebhookManager;
//# sourceMappingURL=webhook-manager.js.map