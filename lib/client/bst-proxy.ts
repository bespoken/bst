/// <reference path="../../typings/index.d.ts" />

import {Tool} from "../core/tool";
import ICommand = commander.ICommand;
import {BespokeClient} from "./bespoke-client";
import {LambdaRunner} from "./lambda-runner";
import {URLMangler} from "./url-mangler";
import {BSTProcess} from "./bst-config";
import {Global} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";

export enum ProxyType {
    HTTP,
    LAMBDA
}

const DefaultLambdaPort = 10000;

/**
 * Exposes the BST proxy command for use
 */
export class BSTProxy {
    private bespokenClient: BespokeClient = null;
    private lambdaRunner: LambdaRunner = null;

    private bespokenHost: string = "proxy.bespoken.tools";
    private bespokenPort: number = 5000;
    private httpPort: number;
    private lambdaFile: string;

    public constructor(public proxyType: ProxyType) {}

    /**
     * Starts an HTTP proxy with specified node and target port
     * @param targetPort
     * @returns {BSTProxy}
     */
    public static http(targetPort: number): BSTProxy {
        let tool: BSTProxy = new BSTProxy(ProxyType.HTTP);
        tool.httpPort = targetPort;
        return tool;
    }

    /**
     * Starts a lambda proxy with the specified node and lambda file
     * @param lambdaFile
     * @returns {BSTProxy}
     */
    public static lambda(lambdaFile: string): BSTProxy {
        let tool: BSTProxy = new BSTProxy(ProxyType.LAMBDA);
        tool.lambdaFile = lambdaFile;
        tool.httpPort = DefaultLambdaPort;
        return tool;
    }

    /**
     * Generates the URL to be used for Alexa configuration
     * @param url
     * @returns {string}
     */
    public static urlgen(url: string): string {
        return URLMangler.mangle(url, Global.config().nodeID());
    }

    /**
     * Specifies the host and port of the bespoken server to connect to
     * @param host
     * @param port
     * @returns {BSTProxy}
     */
    public bespokenServer(host: string, port: number): BSTProxy {
        this.bespokenHost = host;
        this.bespokenPort = port;
        return this;
    }

    /**
     * Specifies the port the Lambda runner should listen on. Only for lambda proxies.
     * @param port
     */
    public lambdaPort(port: number) {
        this.httpPort = port;
    }

    public start(onStarted?: (error?: any) => void): void {
        // Every proxy has a process file associated with it
        BSTProcess.run(this.httpPort, this.proxyType, process.pid);

        this.bespokenClient = new BespokeClient(Global.config().nodeID(), this.bespokenHost, this.bespokenPort, this.httpPort);
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
            this.bespokenClient.shutdown();
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
