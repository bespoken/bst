/// <reference path="../typings/index.d.ts" />

import * as winston from "winston";

export class Global {
    public static MessageDelimiter = "4772616365";
    public static BespokeServerHost = "bst.xappmedia.com";

    public static initialize(): void {
        Global.initializeLogger();

    }

    public static initializeLogger(): void {
        winston.clear();
        // winston.add(winston.transports.File, { filename: "./output.log", level: "info" });
        winston.add(winston.transports.Console,
            {
                colorize: true,
                formatter: Global.formatter,
                level: "info"
            }
        );
    }

    private static formatter(options: any): string {
        return new Date().toISOString() + " "
            + options.level.toUpperCase() + " "
            + (undefined !== options.message ? options.message : "")
            + (options.meta && Object.keys(options.meta).length ? "\n\t"
            + JSON.stringify(options.meta) : "" );
    }
}


export enum NetworkErrorType {
    CONNECTION_REFUSED,
    OTHER,
    TIME_OUT
}