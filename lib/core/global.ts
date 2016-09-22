/// <reference path="../../typings/index.d.ts" />


import {LoggingHelper} from "./logging-helper";
import {BSTConfig} from "../client/bst-config";
import {BSTProcess} from "../client/bst-config";
export class Global {
    public static MessageDelimiter = "4772616365";
    public static MessageIDLength = 13;
    public static KeepAliveMessage = "KEEPALIVE";
    public static BespokeServerHost = "proxy.bespoken.tools";
    private static configuration: BSTConfig = null;

    public static initializeCLI(): void {
        Global.initialize(true);
        Global.configuration = BSTConfig.load();
    }

    public static config(): BSTConfig {
        // If nothing has been configured yet, configure it
        if (Global.configuration === null) {
            Global.initialize(false);
            Global.configuration = BSTConfig.load();
        }
        return Global.configuration;
    }

    public static running(): BSTProcess {
        return BSTProcess.running();
    }

    public static initialize(cli?: boolean): void {
        if (cli === undefined) {
            cli = false;
        }
        LoggingHelper.initialize(cli);
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