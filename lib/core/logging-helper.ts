import * as winston from "winston";
import { format } from "winston";
import {StringUtil} from "./string-util";

export class LoggingHelper {
    private static cli: boolean = false;
    private static verboseEnabled: boolean = false;
    private static logger: winston.Logger = null;

    public static REQUEST_COLOR: string = "#FF6633";
    public static LINK_COLOR: string = "#FF6633";

    public static setVerbose(enableVerbose: boolean) {
        LoggingHelper.verboseEnabled = enableVerbose;
        // TODO validate if this works
        // if (LoggingHelper.verboseEnabled) {
        //     (<any> LoggingHelper.logger.transports[0]).level = "verbose";
        // } else {
        //     (<any> LoggingHelper.logger.transports[0]).level = "info";
        // }
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

    public static prepareForFileLoggingAndDisableConsole(file: string): void {
        LoggingHelper.logger.add(new winston.transports.File({
            format: LoggingHelper.cli ? LoggingHelper.cliFormatter : LoggingHelper.formatter,
            level: "error",
            filename: file,
        }));
        LoggingHelper.logger.remove(winston.transports.Console);
    }

    public static initialize (cli: boolean): void {
        LoggingHelper.cli = cli;
        winston.clear();
        if (LoggingHelper.cli) {
            LoggingHelper.logger = winston.add(new winston.transports.Console({
                format: LoggingHelper.cliFormatter,
                level: "info"
            }));
        } else {
            LoggingHelper.logger = winston.add(new winston.transports.Console({
                format: LoggingHelper.formatter,
                level: "warn"
            }));
        }
    }

    private static formatter = format.printf(({ level, message, label, timestamp, meta }) => {
        return new Date().toISOString() + " "
            + level.toUpperCase() + " "
            + (undefined !== message ? message : "")
            + (meta && Object.keys(meta).length ? "\n\t"
            + JSON.stringify(meta) : "" );
      });


    private static cliFormatter = format.printf(({ level, message, label, timestamp, meta }) => {
        let levelFormatted = level.toUpperCase();
        if (levelFormatted === "VERBOSE") {
            levelFormatted = "VERB";
        }
        return StringUtil.rpad(levelFormatted, " ", 5) + " "
            + new Date().toISOString() + " "
            + (undefined !== message ? message : "")
            + (meta && Object.keys(meta).length ? "\n\t"
            + JSON.stringify(meta) : "" );
      });

}
