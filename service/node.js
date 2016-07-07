"use strict";
class Node {
    constructor(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    forward(sourceSocket, request) {
        console.log("NODE Forwarding ID:" + this.id);
        this.socketHandler.call(request.toTCP(), function (data) {
            console.log("NODE ReplyReceived ID:" + this.id);
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