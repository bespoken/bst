"use strict";
class Node {
    constructor(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    forward(sourceSocket, request) {
        console.log("NODE " + this.id + " Forwarding");
        this.socketHandler.send(request.toTCP());
        this.activeRequest = request;
        this.sourceSocket = sourceSocket;
    }
    handlingRequest() {
        return (this.activeRequest !== null);
    }
    onReply(message) {
        let self = this;
        console.log("NODE " + this.id + " ReplyReceived");
        this.sourceSocket.write(message, function () {
            self.sourceSocket = null;
            self.activeRequest = null;
        });
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map