"use strict";
var string_util_1 = require("./string-util");
var BufferUtil = (function () {
    function BufferUtil() {
    }
    BufferUtil.prettyPrint = function (buffer) {
        var s = buffer.toString();
        return string_util_1.StringUtil.replaceAll(s, "\r\n", "\\n");
    };
    return BufferUtil;
}());
exports.BufferUtil = BufferUtil;
//# sourceMappingURL=buffer-util.js.map