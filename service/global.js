/// <reference path="../typings/globals/node/index.d.ts" />
"use strict";
var Global = (function () {
    function Global() {
    }
    Global.MessageDelimiter = "4772616365";
    return Global;
}());
exports.Global = Global;
(function (NetworkErrorType) {
    NetworkErrorType[NetworkErrorType["CONNECTION_REFUSED"] = 0] = "CONNECTION_REFUSED";
    NetworkErrorType[NetworkErrorType["OTHER"] = 1] = "OTHER";
    NetworkErrorType[NetworkErrorType["TIME_OUT"] = 2] = "TIME_OUT";
})(exports.NetworkErrorType || (exports.NetworkErrorType = {}));
var NetworkErrorType = exports.NetworkErrorType;
