import {IncomingMessage} from "http";
import {LoggingHelper} from "../core/logging-helper";
import {ModuleManager} from "./module-manager";

const bodyParser = require("body-parser");
const express = require("express");

let Logger = "BST-FUNCTION";

/**
 * The FunctionServer wraps a Google Cloud Function routine in a simple HTTP service.
 *
 * It makes it easy to test Cloud Functions locally, and in conjunction with our other tools.
 *
 * To use it, simply provide the filename of the Cloud function along with the port the HTTP server should listen on.
 */
export class FunctionServer {
    private moduleManager: ModuleManager;
    private requests: Array<IncomingMessage> = [];
    private server: any = null;

    /**
     * Creates a server that exposes a Google Cloud Function as an HTTP service
     * @param file The file that defines the cloud function
     * @param functionName The name of the function (as it is exported)
     * @param port The port the service should listen on
     * @param verbose Prints out verbose information about requests and responses
     */
    public constructor(private file: string, private functionName: string, private port: number, private verbose?: boolean) {}

    /**
     * Starts the FunctionServer listening on the port specified in the constructor.
     *
     * @param callback Called once the server has started successfully
     */
    public start (callback?: () => void): void {
        let self = this;

        // Add a watch to the current directory
        this.moduleManager = new ModuleManager(process.cwd());
        this.moduleManager.start();

        const app = express();
        app.use(bodyParser.json());

        app.use((request, response) => {
            // Keep track of the requests so we can destroy them suddenly on a stop
            self.requests.push(request);
            self.invoke(request, response);
        });

        this.server = app.listen(this.port, function () {
            LoggingHelper.info(Logger, "CloudFunctionServer started on port: " + self.port);
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

    private invoke (request: any, response: any): void {
        let path: string = this.file;

        LoggingHelper.debug(Logger, "Invoking Function: " + this.file);
        const cloudFunction = this.moduleManager.module(path);

        if (!(this.functionName in cloudFunction)) {
            const message = "Function: " + this.functionName
                + " does not exist or has not been exported from module: " + this.file;
            LoggingHelper.error(Logger, message);
            response.status(500).send(message);
            return;
        }

        try {
            cloudFunction[this.functionName].call(cloudFunction, request, response);
        } catch (e) {
            if (e.stack) {
                console.error(e.stack);
            } else {
                console.error(e);
            }
            const message = "Unhandled Exception from Cloud Function: " + e;
            response.status(500).send(message);
        }
    }
}