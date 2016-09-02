/// <reference path="../../typings/index.d.ts" />

import * as winston from "winston";
import {StringUtil} from "./string-util";
import {LoggerInstance} from "winston";

export class LoggingHelper {
    private static cli: boolean = false;
    private static verboseEnabled: boolean = false;
    private static logger: LoggerInstance = null;

    public static setVerbose(enableVerbose: boolean) {
        LoggingHelper.verboseEnabled = enableVerbose;

        if (LoggingHelper.verboseEnabled) {
            (<any> LoggingHelper.logger.transports).console.level = "verbose";
        } else {
            (<any> LoggingHelper.logger.transports).console.level = "info";
        }
    }

    public static debug (logger: string, message: string): void {
        LoggingHelper.log("debug", logger, message);
    }

    public static verbose (logger: string, message: string): void {
        LoggingHelper.log("verbose", logger, message);
    }

    public static info (logger: string, message: string): void {
        LoggingHelper.log("info", logger, message);
    }

    public static warn (logger: string, message: string): void {
        LoggingHelper.log("warn", logger, message);
    }

    public static error (logger: string, message: string): void {
        LoggingHelper.log("error", logger, message);
    }

    private static log(level: string, logger: string, message: string) {
        // Rpad and then truncate the logger name
        let loggerString = StringUtil.rpad(logger, " ", 10).substr(0, 10);
        if (LoggingHelper.cli) {
            winston.log(level, message);
        } else {
            winston.log(level, loggerString + "  " + message);
        }
    }

    public static initialize (cli: boolean): void {
        LoggingHelper.cli = cli;
        winston.clear();
        if (LoggingHelper.cli) {
            LoggingHelper.logger = winston.add(winston.transports.Console,
                {
                    formatter: LoggingHelper.cliFormatter,
                    level: "info"
                }
            );
        } else {
            LoggingHelper.logger = winston.add(winston.transports.Console,
                {
                    formatter: LoggingHelper.formatter,
                    level: "info"
                }
            );
        }
    }

    private static formatter(options: any): string {
        return new Date().toISOString() + " "
            + options.level.toUpperCase() + " "
            + (undefined !== options.message ? options.message : "")
            + (options.meta && Object.keys(options.meta).length ? "\n\t"
            + JSON.stringify(options.meta) : "" );
    }

    private static cliFormatter(options: any): string {
        let level = options.level.toUpperCase();
        if (level === "VERBOSE") {
            level = "VERB";
        }
        return StringUtil.rpad(level, " ", 5) + " "
            + new Date().toISOString() + " "
            + (undefined !== options.message ? options.message : "")
            + (options.meta && Object.keys(options.meta).length ? "\n\t"
            + JSON.stringify(options.meta) : "" );
    }

}
