import * as http from "http";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Server} from "http";
import {LoggingHelper} from "../core/logging-helper";
import {ModuleManager} from "./module-manager";
const chalk =  require("chalk");

let Logger = "BST-LAMBDA";

/**
 * The LambdaServer wraps a Node.js Lambda routine in a simple HTTP service.
 *
 * It makes it easy to test Lambdas locally, and in conjunction with our other tools.
 *
 * To use it, simply provide the filename of the Lambda function along with the port the HTTP server should listen on.
 */
export class LambdaServer {
    private moduleManager: ModuleManager;
    private requests: Array<IncomingMessage> = [];
    private server: Server = null;

    /**
     * Creates a server that exposes a Lambda as an HTTP service
     * @param file The file the defines the Lambda
     * @param port The port the service should listen on
     * @param verbose Prints out verbose information about requests and responses
     * @param functionName Use the named function as opposed to the default ("handler")
     */
    public constructor(private file?: string, private port?: number, private verbose?: boolean, private functionName?: string) {}

    /**
     * Starts the LambdaServer listening on the port specified in the constructor.
     *
     * @param callback Called once the server has started successfully
     */
    public start (callback?: () => void): void {
        let self = this;

        this.moduleManager = new ModuleManager(process.cwd());

        this.moduleManager.start();

        this.server = http.createServer();
        this.server.listen(this.port);
        this.server.on("request", function(request: IncomingMessage, response: ServerResponse) {
            self.requests.push(request);

            let requestBody = new Buffer("");
            request.on("data", function(chunk: Buffer) {
                requestBody = Buffer.concat([requestBody, chunk]);
            });

            request.on("end", function () {
                // Handle a ping - so this can work with health checks
                const isPing = request.method === "GET" && request.url &&  request.url.indexOf("/localPing") !== -1;
                if (isPing) {
                    return response.end("ALIVE");
                }
                self.invoke(request, requestBody, response);
            });
        });

        this.server.on("listening", function () {
            LoggingHelper.debug(Logger, "LambdaServer started on port: " + self.server.address().port.toString());
            if (callback !== undefined && callback !== null) {
                callback();
            }
        });
    }

    /**
     * Stops the lambda service
     * @param onStop Callback when all sockets related to the LambdaServer have been cleaned up
     */
    public stop (onStop?: () => void): void {
        this.moduleManager.stop();

        let request: IncomingMessage = null;
        for (request of this.requests) {
            try {
                request.socket.end();
            } catch (e) {

            }
        }

        this.server.close(function () {
            if (onStop !== undefined && onStop !== null) {
                onStop();
            }
        });
    }

    private invoke (request: IncomingMessage, body: Buffer, response: ServerResponse): void {
        let path: string;
        let handlerFunction: string;
        const context: LambdaContext = new LambdaContext(request, body, response, this.verbose);

        const onlyUrl = request.url.split("?")[0];

        if (this.file) {
            path = this.file;
        } else {
            if (onlyUrl !== "/") {

                // verify that path does not contain more than one '.' or node_modules anywhere
                if (/(.*\..*\.)|(.*node_modules)/.test(onlyUrl)) {
                    context.fail(Error(`LambdaServer input url should not contain more than '.' or node_modules.  found: ${onlyUrl}`));
                    return;
                }
                const splitUrl = onlyUrl.split(".");
                path = splitUrl[0];
                handlerFunction = splitUrl[1];
            }
            else {
                // no url argument supplied and no file being used
                context.fail(Error("You should provide the lambda file or pass it in the url"));
                return;
            }
        }

        LoggingHelper.debug(Logger, "Invoking Lambda: " + path);

        const lambda = this.moduleManager.module(path);
        try {
            const bodyToString = body.toString();
            const bodyJSON: any = JSON.parse(bodyToString === "" ? null : bodyToString);

            if (this.verbose) {
                console.log("Request:");
                console.log(JSON.stringify(bodyJSON, null, 2));
            }

            handlerFunction = handlerFunction ? handlerFunction : this.functionName ? this.functionName : "handler";
            lambda[handlerFunction](bodyJSON, context, function(error: Error, result: any) {
                context.done(error, result);
            });
        } catch (e) {
            console.error(chalk.red(e.toString()));
            context.fail(e);
        }
    }
}

class LambdaContext {
    public awsRequestId = "N/A";
    public callbackWaitsForEmptyEventLoop = true;
    public functionName = "BST.LambdaServer";
    public functionVersion = "N/A";
    public memoryLimitInMB = -1;
    public invokedFunctionArn = "N/A";
    public logGroupName = "N/A";
    public logStreamName: string = null;
    public identity: any = null;
    public clientContext: any = null;

    public constructor(public request: IncomingMessage, public body: Buffer, public response: ServerResponse, public verbose: boolean) {}

    public fail(error: Error) {
        this.done(error, null);
    }

    public succeed(body: any) {
        this.done(null, body);
    }

    public getRemainingTimeMillis() {
        return -1;
    }

    public done(error: Error, body: any) {
        let statusCode: number = 200;
        let contentType: string = "application/json";
        let bodyString: string = null;

        if (error === null) {
            bodyString = JSON.stringify(body);
            if (this.verbose) {
                console.log("Response:");
                console.log(JSON.stringify(body, null, 2));
            }
        } else {
            statusCode = 500;
            contentType = "text/plain";
            bodyString = "Unhandled Exception from Lambda: " + error.toString();
        }

        this.response.writeHead(statusCode, {
           "Content-Type": contentType
        });

        this.response.end(new Buffer(bodyString));
    }
}
