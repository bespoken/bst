"use strict";
const net = require('net');
const socket_handler_1 = require("../service/socket-handler");
const webhook_request_1 = require("../service/webhook-request");
const tcp_client_1 = require("./tcp-client");
class BespokeClient {
    constructor(nodeID, host, port, targetPort) {
        this.nodeID = nodeID;
        this.host = host;
        this.port = port;
        this.targetPort = targetPort;
    }
    connect() {
        let self = this;
        this.client = new net.Socket();
        this.socketHandler = new socket_handler_1.SocketHandler(this.client, function (data) {
            self.onMessage(data);
        });
        this.client.connect(this.port, this.host, function () {
            let messageJSON = { "id": self.nodeID };
            let message = JSON.stringify(messageJSON);
            self.send(message);
        });
        this.onWebhookReceived = function (socket, request) {
            console.log("CLIENT " + self.nodeID + " onWebhook: " + request.toString());
            let tcpClient = new tcp_client_1.TCPClient();
            tcpClient.transmit("localhost", self.targetPort, request.toTCP(), function (data) {
                self.socketHandler.send(data);
            });
        };
    }
    send(message) {
        this.socketHandler.send(message);
    }
    onMessage(message) {
        if (message.indexOf("ACK") != -1) {
        }
        else {
            this.onWebhookReceived(this.client, webhook_request_1.WebhookRequest.fromString(message));
        }
    }
    disconnect() {
        this.client.end();
    }
}
exports.BespokeClient = BespokeClient;
//# sourceMappingURL=bespoke-client.js.map