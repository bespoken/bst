/// <reference path="../typings/modules/node-uuid/index.d.ts" />
var Node = (function () {
    function Node(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    Node.prototype.forward = function (sourceSocket, request) {
        console.log("Node Sending: " + request.toTCP());
        this.socketHandler.call(request.toTCP(), function (data) {
            console.log("OnReply: " + data);
            sourceSocket.write(data, function () {
                //sourceSocket.end();
            });
        });
        this.activeRequest = request;
    };
    Node.prototype.hasActiveRequest = function () {
        return this.activeRequest != null;
    };
    Node.prototype.activeRequest = function () {
        return this.activeRequest;
    };
    return Node;
})();
exports.Node = Node;
//# sourceMappingURL=node.js.map