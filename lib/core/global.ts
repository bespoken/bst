/// <reference path="../../typings/index.d.ts" />


import {LoggingHelper} from "./logging-helper";
export class Global {
    public static MessageDelimiter = "4772616365";
    public static KeepAliveMessage = "KEEPALIVE";
    public static BespokeServerHost = "bst.xappmedia.com";

    public static initialize(): void {
        LoggingHelper.initialize();
    }
}


export enum NetworkErrorType {
    CONNECTION_REFUSED,
    OTHER,
    TIME_OUT
}