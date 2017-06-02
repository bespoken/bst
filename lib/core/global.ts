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
    public static SpokesPipeDomain = "bespoken.link";
    public static SpokesDashboardHost = "bespoken.tools/dashboard";

    private static _configuration: BSTConfig = null;
    private static _cli: boolean = false;
    private static _offline: boolean = false;

    private static getOfflineConfig(): BSTConfig {
        const config = new BSTConfig();
        config.configuration = {
            sourceID: "0000000-0000-0000-0000-000000000000",
            secretKey: "offline-mode",
            lambdaDeploy: {
                runtime: "nodejs4.3",
                role: "lambda-bst-execution",
                handler: "index.handler",
                description: "My BST lambda skill",
                timeout: 3,
                memorySize: 128,
                vpcSubnets: "",
                vpcSecurityGroups: "",
                excludeGlobs: "event.json"
            }
        };

        // We avoid saving the offline config to file to force a new config if Global is in normal operation
        config.save = () => {};
        config.commit = () => {};

        return config;
    }

    public static async initializeCLI(): Promise<void> {
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
        await Global.loadConfig();
    }

    public static async loadConfig(): Promise<void> {
        const config = await BSTConfig.load();
        Global._configuration = config;
    }

    public static cli(): boolean {
        return Global._cli;
    }

    public static config(): BSTConfig {
        return Global._configuration;
    }

    public static running(): BSTProcess {
        return BSTProcess.running();
    }

    public static initialize(cli?: boolean, offlineMode?: boolean): void {
        if (cli) {
            Global._cli = cli;
        }

        if (offlineMode) {
            Global._offline = offlineMode;
            Global._configuration = this.getOfflineConfig();
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