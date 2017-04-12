/// <reference path="../../typings/index.d.ts" />

import {BespokeClient} from "./bespoke-client";
import {LambdaServer} from "./lambda-server";
import {URLMangler} from "./url-mangler";
import {BSTProcess} from "./bst-config";
import {Global} from "../core/global";
import {SourceNameGenerator} from "../external/source-name-generator";
import {SpokesClient} from "../external/spokes";

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
    private lambdaServer: LambdaServer = null;
    private spokesClient: SpokesClient = null;
    private sourceNameGenerator: SourceNameGenerator = null;

    private bespokenHost: string = "proxy.bespoken.tools";
    private bespokenPort: number = 5000;
    private httpPort: number;
    private httpDomain: string = "localhost";
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

    public targetDomain(host: string): BSTProxy {
        this.httpDomain = host;
        return this;
    }

    /**
     * Specifies the port the Lambda runner should listen on. Only for lambda proxies.
     * @param port
     */
    public lambdaPort(port: number): BSTProxy {
        this.httpPort = port;
        return this;
    }

    public async createSpokesPipe() {
        this.sourceNameGenerator = new SourceNameGenerator();
        const generatedKey = await this.sourceNameGenerator.callService();
        this.spokesClient = new SpokesClient(generatedKey.id, generatedKey.secretKey);
        const isUUIDUnassigned = await this.spokesClient.verifyUUIDisNew();
        if (isUUIDUnassigned) {
            await this.spokesClient.createPipe();
        }
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
            this.lambdaServer = new LambdaServer(this.lambdaFile, this.httpPort);
            this.lambdaServer.start(callback);
        }

        this.createSpokesPipe();
    }

    public stop(onStopped?: () => void): void {
        if (this.bespokenClient !== null) {
            this.bespokenClient.shutdown();
        }

        if (this.lambdaServer !== null) {
            this.lambdaServer.stop(onStopped);
        } else {
            if (onStopped !== undefined && onStopped !== null) {
                onStopped();
            }
        }
    }
}
