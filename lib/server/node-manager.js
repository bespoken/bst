"use strict";
const net = require("net");
const node_1 = require("./node");
const socket_handler_1 = require("../core/socket-handler");
const global_1 = require("../core/global");
class NodeManager {
    constructor(port) {
        this.port = port;
        this.host = "0.0.0.0";
        this.onConnect = null;
        this.onKeepAliveCallback = null;
        this.nodes = {};
    }
    node(nodeID) {
        return this.nodes[nodeID];
    }
    start() {
        let self = this;
        this.server = net.createServer(function (socket) {
            let initialConnection = true;
            let node = null;
            let socketHandler = new socket_handler_1.SocketHandler(socket, function (message) {
                if (initialConnection) {
                    let connectData = JSON.parse(message);
                    node = new node_1.Node(connectData.id, socketHandler);
                    self.nodes[node.id] = node;
                    socketHandler.send("ACK");
                    initialConnection = false;
                    if (self.onConnect != null) {
                        self.onConnect(node);
                    }
                }
                else if (message === global_1.Global.KeepAliveMessage) {
                    if (self.onKeepAliveCallback !== null) {
                        self.onKeepAliveCallback(node);
                    }
                }
                else if (node.handlingRequest()) {
                    node.onReply(message);
                }
            });
            socketHandler.onCloseCallback = function () {
                if (node !== null) {
                    console.log("NODE CLOSED: " + node.id);
                    delete self.nodes[node.id];
                }
            };
            console.log("NODE CONNECTED: " + socket.remoteAddress + ":" + socket.remotePort);
        }).listen(this.port, this.host);
        console.log("NodeServer listening on " + this.host + ":" + this.port);
    }
    stop(callback) {
        for (let key in this.nodes) {
            if (this.nodes.hasOwnProperty(key)) {
                let node = this.node(key);
                node.socketHandler.disconnect();
            }
        }
        this.server.close(callback);
    }
}
exports.NodeManager = NodeManager;
//# sourceMappingURL=node-manager.js.map