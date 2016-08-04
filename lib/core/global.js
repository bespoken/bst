"use strict";
const logging_helper_1 = require("./logging-helper");
class Global {
    static initialize() {
        logging_helper_1.LoggingHelper.initialize();
    }
}
Global.MessageDelimiter = "4772616365";
Global.KeepAliveMessage = "KEEPALIVE";
Global.BespokeServerHost = "proxy.bespoken.tools";
exports.Global = Global;
(function (NetworkErrorType) {
    NetworkErrorType[NetworkErrorType["CONNECTION_REFUSED"] = 0] = "CONNECTION_REFUSED";
    NetworkErrorType[NetworkErrorType["OTHER"] = 1] = "OTHER";
    NetworkErrorType[NetworkErrorType["TIME_OUT"] = 2] = "TIME_OUT";
})(exports.NetworkErrorType || (exports.NetworkErrorType = {}));
var NetworkErrorType = exports.NetworkErrorType;
//# sourceMappingURL=global.js.map