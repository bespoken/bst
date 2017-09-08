import {BespokeClient} from "./bespoke-client";
import {LambdaServer} from "./lambda-server";
import {BSTProcess} from "./bst-config";
import {Global} from "../core/global";
import {BSTConfig} from "./bst-config";
import {FunctionServer} from "./function-server";
import {LoggingHelper} from "../core/logging-helper";

export enum ProxyType {
    GOOGLE_CLOUD_FUNCTION,
    HTTP,
    LAMBDA
}

const DefaultLambdaPort = 10000;

/**
 * Exposes the BST proxy command for use.
 *
 * The proxy creates a tunnel to the Bespoken Proxy server.
 *
 * To start it a proxy programmatically, simply call:
 * ```javascript
 * const proxy = BSTProxy.lambda("index.js").("SECRET_KEY").start(() => {
 *      // Stuff to do on start
 * });
 * ```
 *
 * To stop, call:
 * ```javascript
 * proxy.stop(() => {
 *     // Stuff to do on stop
 *     // If being used in unit tests, good to wait for this to ensure resources are properly cleaned up
 * });
 * ```
 *
 * Your secret key can be found in the ~/.bst/config file.
 */
export class BSTProxy {
    private bespokenClient: BespokeClient = null;
    private functionServer: FunctionServer = null;
    private lambdaServer: LambdaServer = null;
    private proxySecretKey: string;

    private isSecure: boolean = false;
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
    public static lambda(lambdaFile?: string, functionName?: string): BSTProxy {
        let tool: BSTProxy = new BSTProxy(ProxyType.LAMBDA);
        tool.functionFile = lambdaFile;
        tool.functionName = functionName;
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

    public secretKey(secretKey: string): BSTProxy {
        this.proxySecretKey = secretKey;
        return this;
    }

    /**
     * Enables security which validates that the secret key is present in query or headers
     */
    public activateSecurity() {
       this.isSecure = true;
    }

    /**
     * Specifies the port the Lambda/Function Server should listen on. Only for proxies with built-in servers.
     * @param port
     */
    public port(port: number): BSTProxy {
        this.httpPort = port;
        return this;
    }

    public startWithConfig(onStarted?: (error?: any) => void): BSTProxy {
        this.bespokenClient = new BespokeClient(this.proxySecretKey,
            this.bespokenHost,
            this.bespokenPort,
            this.httpDomain,
            this.httpPort,
            this.isSecure ? this.proxySecretKey : undefined);

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
            this.lambdaServer = new LambdaServer(this.functionFile, this.httpPort, false, this.functionName);
            this.lambdaServer.start(callback);
        }

        if (this.proxyType === ProxyType.GOOGLE_CLOUD_FUNCTION) {
            callbackCountDown++;
            this.functionServer = new FunctionServer(this.functionFile, this.functionName, this.httpPort);
            this.functionServer.start(callback);
        }

        return this;
    }

    public start(onStarted?: (error?: any) => void): void {
        // If we have a configuration (i.e., are being run from CLI), we use it
        const self = this;
        if (Global.config()) {
            BSTProcess.run(this.httpPort, this.proxyType, process.pid);
            this.proxySecretKey = Global.config().secretKey();
            this.startWithConfig(onStarted);
        } else {
            // Handle start when being called programmatically (and presumably standalone)
            if (!this.proxySecretKey) {
                // Load config if not present
                BSTConfig.load().then((config) => {
                    self.proxySecretKey = config.secretKey();
                    self.startWithConfig(onStarted);
                    LoggingHelper.initialize(false);
                });
                return;
            }

            self.startWithConfig(onStarted);
            LoggingHelper.initialize(false);
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
