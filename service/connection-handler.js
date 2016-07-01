"use strict";
/**
 * Created by jpk on 7/1/16.
 */
var net = require('net');
var connection_1 = require("./connection");
var ConnectionHandler = (function () {
    function ConnectionHandler(port, onConnect) {
        this.port = port;
        this.onConnect = onConnect;
        this.host = '0.0.0.0';
        this.connections = {};
    }
    ConnectionHandler.prototype.start = function () {
        console.log("Test!");
        var self = this;
        net.createServer(function (socket) {
            var connection = new connection_1.Connection(self, socket);
            self.connections[connection.uuid] = connection;
            self.onConnect(connection);
            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        }).listen(this.port, this.host);
        console.log('Server listening on ' + this.host + ':' + this.port);
    };
    return ConnectionHandler;
}());
exports.ConnectionHandler = ConnectionHandler;
