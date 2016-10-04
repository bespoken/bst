/// <reference path="../../typings/index.d.ts" />


import {LoggingHelper} from "./logging-helper";
import {BSTConfig} from "../client/bst-config";
import {BSTProcess} from "../client/bst-config";
const chalk = require("chalk");

export class Global {
    public static MessageDelimiter = "4772616365";
    public static MessageIDLength = 13;
    public static KeepAliveMessage = "KEEPALIVE";
    public static BespokeServerHost = "proxy.bespoken.tools";
    private static _configuration: BSTConfig = null;
    private static _cli: boolean = false;

    public static initializeCLI(): void {
        // Replace console.error so it prints in a different color
        let originalError = console.error;
        console.error = function(message) {
            if (message !== undefined) {
                originalError(chalk.red(message));
            } else {
                originalError();
            }
        };

        Global.initialize(true);
        Global._configuration = BSTConfig.load();
    }

    public static cli(): boolean {
        return Global._cli;
    }

    public static config(): BSTConfig {
        // If nothing has been configured yet, configure it
        if (Global._configuration === null) {
            Global.initialize(false);
            Global._configuration = BSTConfig.load();
        }
        return Global._configuration;
    }

    public static running(): BSTProcess {
        return BSTProcess.running();
    }

    public static initialize(cli?: boolean): void {
        if (cli !== undefined && cli !== null) {
            Global._cli = cli;
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