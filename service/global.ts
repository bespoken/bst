/// <reference path="../typings/globals/node/index.d.ts" />

export class Global {
    public static MessageDelimiter = "4772616365";
}

export enum NetworkErrorType {
    CONNECTION_REFUSED,
    OTHER,
    TIME_OUT
}