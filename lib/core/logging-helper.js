"use strict";
const winston = require("winston");
class LoggingHelper {
    static debug(logger, message) {
        LoggingHelper.log("debug", logger, message);
    }
    static info(logger, message) {
        LoggingHelper.log("info", logger, message);
    }
    static warn(logger, message) {
        LoggingHelper.log("warn", logger, message);
    }
    static error(logger, message) {
        LoggingHelper.log("error", logger, message);
    }
    static log(level, logger, message) {
        winston.log(level, logger + " " + message);
    }
    static initialize() {
        winston.clear();
        winston.add(winston.transports.Console, {
            formatter: LoggingHelper.formatter,
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
exports.LoggingHelper = LoggingHelper;
//# sourceMappingURL=logging-helper.js.map