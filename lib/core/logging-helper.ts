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
        if (LoggingHelper.verboseEnabled) {
            (<any> LoggingHelper.logger).level = "verbose";
        } else {
            (<any> LoggingHelper.logger).level = "info";
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

    public static error (logger: string, message: string, callback?: winston.LogCallback): void {
        LoggingHelper.log("error", logger, message, callback);
    }

    private static log(level: string, logger: string, message: string, callback?: winston.LogCallback) {
        if (!LoggingHelper.logger) return;
        if (LoggingHelper.cli) {
            LoggingHelper.logger.log(level, message, callback);
        } else {
            // Rpad and then truncate the logger name
            let loggerString = StringUtil.rpad(logger, " ", 10).substr(0, 10);
            LoggingHelper.logger.log(level, loggerString + "  " + message, callback);
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
            LoggingHelper.logger = winston.createLogger({
                format: LoggingHelper.cliFormatter,
                level: "info",
                transports: [new winston.transports.Console()],
            });
        } else {
            LoggingHelper.logger = winston.createLogger({
                format: LoggingHelper.formatter,
                level: "warn",
                transports: [new winston.transports.Console()],
            });
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
