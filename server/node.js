"use strict";
var Node = (function () {
    function Node(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    Node.prototype.forward = function (sourceSocket, request) {
        var self = this;
        console.log("NODE " + this.id + " Forwarding");
        this.socketHandler.call(request.toTCP(), function (data) {
            console.log("NODE " + self.id + " ReplyReceived");
            sourceSocket.write(data, function () {
            });
        });
        this.activeRequest = request;
    };
    return Node;
}());
exports.Node = Node;
