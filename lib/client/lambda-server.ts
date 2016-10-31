import * as fs from "fs";
import * as http from "http";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Server} from "http";
import {LoggingHelper} from "../core/logging-helper";
import {NodeUtil} from "../core/node-util";
import {FSWatcher} from "fs";

let Logger = "BST-LAMBDA";

/**
 * The LambdaServer wraps a Node.js Lambda routine in a simple HTTP service.
 *
 * It makes it easy to test Lambdas locally, and in conjunction with our other Bespoken Tools.
 *
 * To use it, simply provide the filename of the Lambda function along with the port the HTTP server should listen on.
 */
export class LambdaServer {
    private server: Server = null;
    private dirty: boolean = false;
    private lambda: any = null;
    private watcher: FSWatcher = null;
    private requests: Array<IncomingMessage> = [];
    private onDirty: (filename: string) => void = null; // Callback for test-ability

    /**
     * Creates a server that exposes a Lambda as an HTTP service
     * @param file The file the defines the Lambda
     * @param port The port the service should listen on
     * @param verbose Prints out verbose information about requests and responses
     */
    public constructor(private file: string, private port: number, private verbose?: boolean) {}

    /**
     * Starts the LambdaServer listening on the port specified in the constructor.
     *
     * @param callback Called once the server has started successfully
     */
    public start (callback?: () => void): void {
        let self = this;

        // Add a watch to the current directory
        let watchOptions = {"persistent": false, "recursive": true};
        this.watcher = fs.watch(process.cwd(), watchOptions, function(event: string, filename: string) {
            let exclude = false;
            if (filename.indexOf("node_modules") !== -1) {
                exclude = true;
            } else if (filename.endsWith("___")) {
                exclude = true;
            } else if (filename.startsWith(".")) {
                exclude = true;
            }

            if (!exclude) {
                LoggingHelper.info(Logger, "FS.Watch Event: " + event + ". File: " + filename + ". Reloading.");
                self.dirty = true;
                if (self.onDirty !== undefined && self.onDirty !== null) {
                    self.onDirty(filename);
                }
            }
        });

        this.server = http.createServer();
        this.server.listen(this.port);
        this.server.on("request", function(request: IncomingMessage, response: ServerResponse) {
            self.requests.push(request);

            let requestBody: string = "";
            request.on("data", function(chunk: Buffer) {
                requestBody += chunk.toString();
            });

            request.on("end", function () {
                // Handle a ping - so this can work with health checks
                if (request.method === "GET") {
                    return response.end("ALIVE");
                } else {
                    self.invoke(request, requestBody, response);
                }
            });
        });

        this.server.on("listening", function () {
            LoggingHelper.info(Logger, "LambdaServer started on port: " + self.server.address().port.toString());
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
        this.watcher.close();

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

    private invoke (request: IncomingMessage, body: string, response: ServerResponse): void {
        let path: string = this.file;
        if (!path.startsWith("/")) {
            path = [process.cwd(), this.file].join("/");
        }

        LoggingHelper.debug(Logger, "Invoking Lambda: " + this.file);
        if (this.lambda === null || this.dirty) {
            this.lambda = NodeUtil.load(path);
            this.dirty = false;
        }

        // let lambda = System.import("./" + file);
        const context: LambdaContext = new LambdaContext(request, response, this.verbose);
        try {
            const bodyJSON: any = JSON.parse(body);
            if (this.verbose) {
                console.log("Request:");
                console.log(JSON.stringify(bodyJSON, null, 2));
            }
            this.lambda.handler(bodyJSON, context, function(error: Error, result: any) {
                context.done(error, result);
            });
        } catch (e) {
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

    public constructor(public request: IncomingMessage, public response: ServerResponse, public verbose: boolean) {}

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
            bodyString = error.toString();
        }

        this.response.writeHead(statusCode, {
           "Content-Type": contentType
        });

        this.response.end(new Buffer(bodyString));
    }
}
