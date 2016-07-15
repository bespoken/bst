"use strict";
const winston = require("winston");
class Global {
    static initialize() {
        Global.initializeLogger();
    }
    static initializeLogger() {
        winston.clear();
        let logger = winston.add(winston.transports.Console, {
            formatter: Global.formatter,
            level: "info"
        });
    }
    static formatter(options) {
        return new Date().toISOString() + " "
            + options.level.toUpperCase() + " "
            + (undefined !== options.message ? options.message : "")
            + (options.meta && Object.keys(options.meta).length ? "\n\t"
                + JSON.stringify(options.meta) : "");
    }
}
Global.MessageDelimiter = "4772616365";
Global.BespokeServerHost = "bst.xappmedia.com";
exports.Global = Global;
(function (NetworkErrorType) {
    NetworkErrorType[NetworkErrorType["CONNECTION_REFUSED"] = 0] = "CONNECTION_REFUSED";
    NetworkErrorType[NetworkErrorType["OTHER"] = 1] = "OTHER";
    NetworkErrorType[NetworkErrorType["TIME_OUT"] = 2] = "TIME_OUT";
})(exports.NetworkErrorType || (exports.NetworkErrorType = {}));
var NetworkErrorType = exports.NetworkErrorType;
//# sourceMappingURL=global.js.map