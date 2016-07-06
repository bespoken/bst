/// <reference path="../typings/modules/es6-promise/index.d.ts" />
"use strict";
var net = require('net');
var socket_handler_1 = require("../service/socket-handler");
var webhook_request_1 = require("../service/webhook-request");
var BespokeClient = (function () {
    function BespokeClient(nodeID, host, port) {
        this.nodeID = nodeID;
        this.host = host;
        this.port = port;
    }
    BespokeClient.prototype.connect = function () {
        var self = this;
        this.client = new net.Socket();
        this.socketHandler = new socket_handler_1.SocketHandler(this.client, function (data) {
            console.log("ClientReceived: " + data);
            self.onMessage(data);
        });
        //Use a promise to so that other things wait on the connection
        this.client.connect(this.port, this.host, function () {
            //As soon as we connect, we send our ID
            var messageJSON = { "id": self.nodeID };
            var message = JSON.stringify(messageJSON);
            self.send(message);
        });
    };
    BespokeClient.prototype.send = function (message) {
        this.socketHandler.send(message);
    };
    BespokeClient.prototype.onMessage = function (message) {
        if (message.indexOf("ACK") != -1) {
            console.log("Client: ACK RECEIVED");
        }
        else {
            this.onWebhookReceived(webhook_request_1.WebhookRequest.fromString(message));
        }
    };
    BespokeClient.prototype.disconnect = function () {
        this.client.end();
    };
    return BespokeClient;
}());
exports.BespokeClient = BespokeClient;
