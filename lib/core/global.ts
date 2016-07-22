/// <reference path="../../typings/index.d.ts" />

import {Env} from "./env-helper";
import {LoggingHelper} from "./logging-helper";

export class Global {
    public static MessageDelimiter = "4772616365";
    public static BespokeServerHost = "bst.xappmedia.com";

    public static initialize(): void {
        LoggingHelper.initialize();
        Env.initialize();
    }
}


export enum NetworkErrorType {
    CONNECTION_REFUSED,
    OTHER,
    TIME_OUT
}