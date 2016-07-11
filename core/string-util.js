/// <reference path="../typings/globals/node/index.d.ts" />
"use strict";
var StringUtil = (function () {
    function StringUtil() {
    }
    StringUtil.replaceAll = function (s, val, newVal) {
        while (s.indexOf(val) !== -1) {
            s = s.replace(val, newVal);
        }
        return s;
    };
    StringUtil.prettyPrint = function (bufferString) {
        var s = StringUtil.replaceAll(bufferString, "\r\n", "\\n");
        s = StringUtil.replaceAll(s, "\n", "\\n");
        return s;
    };
    return StringUtil;
}());
exports.StringUtil = StringUtil;
