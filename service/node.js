var Node = (function () {
    function Node(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    Node.prototype.forward = function (data) {
        console.log("Node Sending: " + data);
        this.socketHandler.send(data);
    };
    return Node;
})();
exports.Node = Node;
//# sourceMappingURL=node.js.map