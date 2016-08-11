/// <reference path="../../typings/index.d.ts" />

import {Tool} from "../core/tool";
import ICommand = commander.ICommand;
import {BespokeClient} from "./bespoke-client";
import {LambdaRunner} from "./lambda-runner";
import {URLMangler} from "./url-mangler";

export enum ProxyType {
    HTTP,
    LAMBDA
}

const DefaultLambdaPort = 10000;

export class BSTProxy {
    private bespokenClient: BespokeClient = null;
    private lambdaRunner: LambdaRunner = null;

    private bespokenHost: string = "proxy.bespoken.tools";
    private bespokenPort: number = 5000;
    private httpPort: number;
    private lambdaFile: string;

    public constructor(public proxyType: ProxyType, public nodeID: string) {}

    public static http(nodeID: string, targetPort: number): BSTProxy {
        let tool: BSTProxy = new BSTProxy(ProxyType.HTTP, nodeID);
        tool.httpPort = targetPort;
        return tool;
    }

    public static lambda(nodeID: string, lambdaFile: string): BSTProxy {
        let tool: BSTProxy = new BSTProxy(ProxyType.LAMBDA, nodeID);
        tool.httpPort = DefaultLambdaPort;
        return tool;
    }

    public static urlgen(nodeID: string, url: string): string {
        let mangler = new URLMangler(url, nodeID);
        return mangler.mangle();
    }

    public bespokenServer(host: string, port: number): BSTProxy {
        this.bespokenHost = host;
        this.bespokenPort = port;
        return this;
    }

    public lambdaPort(port: number) {
        this.httpPort = port;
    }

    public start(onStarted?: () => void): void {
        this.bespokenClient = new BespokeClient(this.nodeID, this.bespokenHost, this.bespokenPort, this.httpPort);
        if (onStarted !== undefined) {
            this.bespokenClient.onConnect = onStarted;
        }
        this.bespokenClient.connect();

        if (this.proxyType === ProxyType.LAMBDA) {
            this.lambdaRunner = new LambdaRunner(this.lambdaFile, this.httpPort);
            this.lambdaRunner.start();
        }
    }

    public stop(onStopped?: () => void): void {
        if (this.bespokenClient !== null) {
            this.bespokenClient.disconnect();
        }

        if (this.lambdaRunner !== null) {
            this.lambdaRunner.stop(onStopped);
        } else {
            if (onStopped !== undefined && onStopped !== null) {
                onStopped();
            }
        }
    }
}
