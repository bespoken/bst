/// <reference path="../typings/modules/node-uuid/index.d.ts" />
"use strict";
var Node = (function () {
    function Node(id, socketHandler) {
        this.id = id;
        this.socketHandler = socketHandler;
    }
    Node.prototype.forward = function (data) {
        console.log("Sending: " + data);
        this.socketHandler.send(data, null);
    };
    return Node;
}());
exports.Node = Node;
