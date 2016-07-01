"use strict";
/**
 * Created by jpk on 7/1/16.
 */
var net = require('net');
var node_connection_1 = require("./node-connection");
var NodeManager = (function () {
    function NodeManager(port) {
        this.port = port;
        this.host = '0.0.0.0';
        this.nodes = {};
    }
    NodeManager.prototype.start = function () {
        var self = this;
        net.createServer(function (socket) {
            var node = new node_connection_1.NodeConnection(self, socket);
            self.nodes[node.uuid] = node;
            self.onConnect(node);
            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        }).listen(this.port, this.host);
        console.log('Server listening on ' + this.host + ':' + this.port);
    };
    return NodeManager;
}());
exports.NodeManager = NodeManager;
