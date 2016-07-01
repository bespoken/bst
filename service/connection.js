/// <reference path="../typings/modules/node-uuid/index.d.ts" />
"use strict";
var uuid = require('node-uuid');
var Connection = (function () {
    function Connection(connectionHandler, socket) {
        this.connectionHandler = connectionHandler;
        this.socket = socket;
        var self = this;
        this.uuid = uuid.v4();
        // Add a 'data' event handler to this instance of socket
        this.socket.on('data', function (data) {
            console.log('DATA ' + self.socket.remoteAddress + ': ' + data);
            // Write the data back to the socket, the client will receive it as data from the server
            self.socket.write('You said "' + data + '"');
            self.connectionHandler.onReceive(self, data);
        });
        // Add a 'close' event handler to this instance of socket
        socket.on('close', function () {
            self.connectionHandler.onClose(self);
        });
    }
    Connection.prototype.remoteAddress = function () {
        return this.socket.remoteAddress;
    };
    return Connection;
}());
exports.Connection = Connection;
