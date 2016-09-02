import * as fs from "fs";
import * as http from "http";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Server} from "http";
import {LoggingHelper} from "../core/logging-helper";
import {NodeUtil} from "../core/node-util";
import {FSWatcher} from "fs";

let Logger = "BST-LAMBDA";

export class LambdaRunner {
    private server: Server = null;
    private dirty: boolean = false;
    private lambda: any = null;
    private watcher: FSWatcher = null;
    private requests: Array<IncomingMessage> = [];
    public onDirty: () => void = null; // Callback for test-ability

    /**
     * The file to run
     * @param file
     * @param port
     * @param debug
     */
    public constructor(public file: string, public port: number, public debug?: boolean) {
        // We need the debug flag for testing this class
        // It causes us to store off the requests so that we can close sockets and shutdown quickly
        //  Otherwise we have to wait for timeouts
        if (this.debug === undefined) {
            this.debug = false;
        }
    }

    public start (callback?: () => void): void {
        let self = this;

        // Add a watch to the current directory
        let watchOptions = {"persistent": false, "recursive": true};
        this.watcher = fs.watch(process.cwd(), watchOptions, function(event: string, filename: string) {
            if (filename.indexOf("node_modules") === -1) {
                LoggingHelper.info(Logger, "FS.Watch Event: " + event + ". File: " + filename + ". Reloading.");
                self.dirty = true;
                if (self.onDirty !== undefined && self.onDirty !== null) {
                    self.onDirty();
                }
            }
        });

        this.server = http.createServer();
        this.server.listen(this.port);
        this.server.on("request", function(request: IncomingMessage, response: ServerResponse) {
            if (self.debug) {
                self.requests.push(request);
            }

            let requestBody: string = "";
            request.on("data", function(chunk: Buffer) {
                requestBody += chunk.toString();
            });

            request.on("end", function () {
                self.invoke(requestBody, response);
            });
        });

        this.server.on("listening", function () {
            LoggingHelper.info(Logger, "LambdaRunner started on port: " + self.server.address().port.toString());
            if (callback !== undefined && callback !== null) {
                callback();
            }
        });
    }

    public invoke (body: string, response: ServerResponse): void {
        let path: string = this.file;
        if (!path.startsWith("/")) {
            path = [process.cwd(), this.file].join("/");
        }

        LoggingHelper.info(Logger, "Invoking Lambda: " + this.file);
        if (this.lambda === null || this.dirty) {
            this.lambda = NodeUtil.load(path);
            this.dirty = false;
        }

        // let lambda = System.import("./" + file);
        let context: LambdaContext = new LambdaContext(response);
        try {
            let bodyJSON: any = JSON.parse(body);
            this.lambda.handler(bodyJSON, context);
        } catch (e) {
            context.fail("Exception: " + e.message);
        }
    }

    public stop (onStop?: () => void): void {
        this.watcher.close();

        if (this.debug) {
            let request: IncomingMessage = null;
            for (request of this.requests) {
                try {
                    request.socket.end();
                } catch (e) {

                }
            }
        }
        this.server.close(function () {
            if (onStop !== undefined && onStop !== null) {
                onStop();
            }
        });
    }
}

export class LambdaContext {

    public constructor(public response: ServerResponse) {}

    public fail(body: any) {
        this.done(false, body);
    }

    public succeed(body: any) {
        this.done(true, body);
    }

    private done(success: boolean, body: any) {
        let statusCode: number = 200;
        let contentType: string = "application/json";
        let bodyString: string = null;

        if (success) {
            bodyString = JSON.stringify(body);
        } else {
            statusCode = 500;
            contentType = "text/plain";
            bodyString = body.toString();
        }

        this.response.writeHead(statusCode, {
           "Content-Type": contentType
        });

        if (body) {
            this.response.end(new Buffer(bodyString));
        } else {
            this.response.end();
        }

    }
}
