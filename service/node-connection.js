/// <reference path="../typings/modules/node-uuid/index.d.ts" />
"use strict";
var uuid = require('node-uuid');
var NodeConnection = (function () {
    function NodeConnection(nodeManager, socket) {
        this.nodeManager = nodeManager;
        this.socket = socket;
        var self = this;
        this.uuid = uuid.v4();
        // Add a 'data' event handler to this instance of socket
        this.socket.on('data', function (data) {
            console.log('DATA ' + self.socket.remoteAddress + ': ' + data);
            // Write the data back to the socket, the client will receive it as data from the server
            self.socket.write('You said "' + data + '"');
            self.nodeManager.onReceive(self, data);
        });
        // Add a 'close' event handler to this instance of socket
        socket.on('close', function () {
            self.nodeManager.onClose(self);
        });
    }
    NodeConnection.prototype.remoteAddress = function () {
        return this.socket.remoteAddress;
    };
    return NodeConnection;
}());
exports.NodeConnection = NodeConnection;
