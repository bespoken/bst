/// <reference path="../typings/globals/node/index.d.ts" />
"use strict";
var string_util_1 = require("./string-util");
var BufferUtil = (function () {
    function BufferUtil() {
    }
    BufferUtil.prettyPrint = function (buffer) {
        var s = buffer.toString();
        return string_util_1.StringUtil.prettyPrint(s);
    };
    return BufferUtil;
}());
exports.BufferUtil = BufferUtil;
