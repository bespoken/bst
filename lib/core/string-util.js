"use strict";
class StringUtil {
    static replaceAll(s, val, newVal) {
        while (s.indexOf(val) !== -1) {
            s = s.replace(val, newVal);
        }
        return s;
    }
    static prettyPrint(bufferString) {
        let s = StringUtil.replaceAll(bufferString, "\r\n", "\\n");
        s = StringUtil.replaceAll(s, "\n", "\\n");
        return s;
    }
    static rpad(s, padString, length) {
        let str = s;
        while (str.length < length)
            str = str + padString;
        return str;
    }
}
exports.StringUtil = StringUtil;
//# sourceMappingURL=string-util.js.map