/// <reference path="../../typings/index.d.ts" />

import {BespokeClient} from "./bespoke-client";
import {LambdaServer} from "./lambda-server";
import {URLMangler} from "./url-mangler";
import {BSTProcess} from "./bst-config";
import {Global} from "../core/global";
import {FunctionServer} from "./function-server";

export enum ProxyType {
    GOOGLE_CLOUD_FUNCTION,
    HTTP,
    LAMBDA
}

const DefaultLambdaPort = 10000;

/**
 * Exposes the BST proxy command for use
 */
export class BSTProxy {
    private bespokenClient: BespokeClient = null;
    private functionServer: FunctionServer = null;
    private lambdaServer: LambdaServer = null;

    private bespokenHost: string = "proxy.bespoken.tools";
    private bespokenPort: number = 5000;
    private functionFile: string;
    private functionName: string;
    private httpPort: number;
    private httpDomain: string = "localhost";

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
        tool.functionFile = lambdaFile;
        tool.httpPort = DefaultLambdaPort;
        return tool;
    }

    /**
     * Starts a function proxy with the specified node and cloud function file
     * @param functionFile
     * @param functionName
     * @returns {BSTProxy}
     */
    public static cloudFunction(functionFile: string, functionName?: string): BSTProxy {
        let tool: BSTProxy = new BSTProxy(ProxyType.GOOGLE_CLOUD_FUNCTION);
        tool.functionFile = functionFile;
        tool.functionName = functionName;

        tool.httpPort = DefaultLambdaPort;
        return tool;
    }

    /**
     * Generates the URL to be used for Alexa configuration
     * @param url
     * @returns
     */
    public static urlgen(url: string): string {
        return URLMangler.mangle(url, Global.config().sourceID(), Global.config().secretKey());
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

    public targetDomain(host: string): BSTProxy {
        this.httpDomain = host;
        return this;
    }

    /**
     * Specifies the port the Lambda/Function Server should listen on. Only for proxies with built-in servers.
     * @param port
     */
    public port(port: number): BSTProxy {
        this.httpPort = port;
        return this;
    }

    public start(onStarted?: (error?: any) => void): void {
        // Every proxy has a process file associated with it
        BSTProcess.run(this.httpPort, this.proxyType, process.pid);

        this.bespokenClient = new BespokeClient(Global.config().nodeID(), this.bespokenHost, this.bespokenPort, this.httpDomain, this.httpPort);

        // Make sure all callbacks have been hit before returning
        //  We will have to wait for two callbacks if this using the Lambda proxy
        //  Otherwise, it is just one
        let callbackCountDown = 1;
        const callback = function () {
            callbackCountDown--;
            if (callbackCountDown === 0 && onStarted !== undefined) {
                onStarted();
            }
        };

        this.bespokenClient.onConnect = callback;
        this.bespokenClient.connect();

        if (this.proxyType === ProxyType.LAMBDA) {
            callbackCountDown++;
            this.lambdaServer = new LambdaServer(this.functionFile, this.httpPort);
            this.lambdaServer.start(callback);
        }

        if (this.proxyType === ProxyType.GOOGLE_CLOUD_FUNCTION) {
            callbackCountDown++;
            this.functionServer = new FunctionServer(this.functionFile, this.functionName, this.httpPort);
            this.functionServer.start(callback);
        }
    }

    public stop(onStopped?: () => void): void {
        if (this.bespokenClient !== null) {
            this.bespokenClient.shutdown();
        }

        if (this.lambdaServer !== null) {
            this.lambdaServer.stop(onStopped);
        } else if (this.functionServer !== null) {
            this.functionServer.stop(onStopped);
        } else {
            if (onStopped !== undefined && onStopped !== null) {
                onStopped();
            }
        }
    }
}
