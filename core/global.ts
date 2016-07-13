/// <reference path="../typings/globals/node/index.d.ts" />

export class Global {
    public static MessageDelimiter = "4772616365";
    public static BespokeServerHost = "bst.xappmedia.com";
}

export enum NetworkErrorType {
    CONNECTION_REFUSED,
    OTHER,
    TIME_OUT
}