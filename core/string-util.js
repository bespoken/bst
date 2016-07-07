"use strict";
var StringUtil = (function () {
    function StringUtil() {
    }
    StringUtil.replaceAll = function (s, val, newVal) {
        while (s.indexOf(val) != -1) {
            s = s.replace(val, newVal);
        }
        return s;
    };
    return StringUtil;
}());
exports.StringUtil = StringUtil;
//# sourceMappingURL=string-util.js.map