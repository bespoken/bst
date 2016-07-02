/// <reference path="../typings/modules/node-uuid/index.d.ts" />
"use strict";
var Node = (function () {
    function Node(id, remoteAddress) {
        this.id = id;
        this.remoteAddress = remoteAddress;
    }
    return Node;
}());
exports.Node = Node;
