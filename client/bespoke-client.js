/// <reference path="../typings/modules/es6-promise/index.d.ts" />
var net = require('net');
var socket_handler_1 = require("../service/socket-handler");
var webhook_request_1 = require("../service/webhook-request");
var tcp_client_1 = require("./tcp-client");
var BespokeClient = (function () {
    function BespokeClient(nodeID, host, port, targetPort) {
        this.nodeID = nodeID;
        this.host = host;
        this.port = port;
        this.targetPort = targetPort;
    }
    BespokeClient.prototype.connect = function () {
        var self = this;
        this.client = new net.Socket();
        this.socketHandler = new socket_handler_1.SocketHandler(this.client, function (data) {
            self.onMessage(data);
        });
        //Use a promise to so that other things wait on the connection
        this.client.connect(this.port, this.host, function () {
            //As soon as we connect, we send our ID
            var messageJSON = { "id": self.nodeID };
            var message = JSON.stringify(messageJSON);
            self.send(message);
        });
        this.onWebhookReceived = function (socket, request) {
            var tcpClient = new tcp_client_1.TCPClient();
            tcpClient.transmit("localhost", self.targetPort, request.toTCP(), function (data) {
                self.socketHandler.send(data);
            });
        };
    };
    BespokeClient.prototype.send = function (message) {
        this.socketHandler.send(message);
    };
    BespokeClient.prototype.onMessage = function (message) {
        if (message.indexOf("ACK") != -1) {
        }
        else {
            this.onWebhookReceived(this.client, webhook_request_1.WebhookRequest.fromString(message));
        }
    };
    BespokeClient.prototype.disconnect = function () {
        this.client.end();
    };
    return BespokeClient;
})();
exports.BespokeClient = BespokeClient;
//# sourceMappingURL=bespoke-client.js.map