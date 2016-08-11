/// <reference path="../../typings/index.d.ts" />


import {LoggingHelper} from "./logging-helper";
export class Global {
    public static MessageDelimiter = "4772616365";
    public static KeepAliveMessage = "KEEPALIVE";
    public static BespokeServerHost = "proxy.bespoken.tools";

    public static initialize(): void {
        LoggingHelper.initialize();

    }

    public static version(): string {
        let packageInfo: any = require("../../package.json");
        return packageInfo.version;
    }
}


export enum NetworkErrorType {
    CONNECTION_REFUSED,
    OTHER,
    TIME_OUT
}