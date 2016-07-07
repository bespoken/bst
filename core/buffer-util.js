/// <reference path="../typings/globals/node/index.d.ts" />
var string_util_1 = require("./string-util");
var BufferUtil = (function () {
    function BufferUtil() {
    }
    BufferUtil.prettyPrint = function (buffer) {
        var s = buffer.toString();
        s = string_util_1.StringUtil.replaceAll(s, "\r\n", "\\n");
        s = string_util_1.StringUtil.replaceAll(s, "\n", "\\n");
        return s;
    };
    return BufferUtil;
})();
exports.BufferUtil = BufferUtil;
//# sourceMappingURL=buffer-util.js.map