"use strict";
class Node {
    constructor(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    forward(sourceSocket, request) {
        let self = this;
        console.log("NODE " + this.id + " Forwarding");
        this.socketHandler.call(request.toTCP(), function (data) {
            console.log("NODE " + self.id + " ReplyReceived");
            sourceSocket.write(data, function () {
            });
        });
        this.activeRequest = request;
    }
    hasActiveRequest() {
        return this.activeRequest != null;
    }
    webhookRequest() {
        return this.activeRequest;
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map