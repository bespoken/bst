"use strict";
const net = require("net");
const socket_handler_1 = require("../core/socket-handler");
const webhook_request_1 = require("../core/webhook-request");
const tcp_client_1 = require("./tcp-client");
const global_1 = require("../core/global");
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
            console.log("CLIENT " + self.host + ":" + self.port + " Connected");
            let messageJSON = { "id": self.nodeID };
            let message = JSON.stringify(messageJSON);
            self.send(message);
        });
        this.onWebhookReceived = function (socket, request) {
            let self = this;
            console.log("CLIENT " + self.nodeID + " onWebhook: " + request.toString());
            let tcpClient = new tcp_client_1.TCPClient();
            tcpClient.transmit("localhost", self.targetPort, request.toTCP(), function (data, error, message) {
                if (data != null) {
                    self.socketHandler.send(data);
                }
                else if (error === global_1.NetworkErrorType.CONNECTION_REFUSED) {
                    console.log("CLIENT Connection Refused, Port " + self.targetPort + ". Is your server running?");
                    if (self.onError != null) {
                        self.onError(error, message);
                    }
                }
            });
        };
    }
    send(message) {
        this.socketHandler.send(message);
    }
    onMessage(message) {
        if (message.indexOf("ACK") !== -1) {
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