"use strict";
const string_util_1 = require("./string-util");
class BufferUtil {
    static prettyPrint(buffer) {
        let s = buffer.toString();
        return string_util_1.StringUtil.prettyPrint(s);
    }
}
exports.BufferUtil = BufferUtil;
//# sourceMappingURL=buffer-util.js.map