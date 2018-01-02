import {LoglessContext} from "../logless/logless-context";
import {LogType} from "./logless-context";

/**
 * Logless will automatically capture logs and diagnostics for your Node.js Lambda, Google Cloud Function or Express.js service.
 *
 * Before you integrate the code, you will need to a key. You get it from [the Bespoken Dashboard](https://apps.bespoken.io/dashboard).
 * Once integrated, this is where your logs and data will be viewable.
 *
 * Install the dependency
 *
 * <pre><code>
 *     $npm install bespoken-tools --save
 * </code></pre>
 *
 * To use it with Lambdas, simply wrap your function handler, like so:
 * <pre><code>
 *     var bst = require('bespoken-tools');
 *
 *     exports.handler = bst.Logless.capture("&lt;SECRET_KEY&gt;", function (event, context) {
 *         // Lambda code goes here
 *         context.done(null, "Hello World");
 *     });
 *
 * </code></pre>
 *
 * To use it with Google Cloud Functions, simply wrap your function handler:
 * <pre><code>
 *     var bst = require('bespoken-tools');
 *
 *     exports.hello = bst.Logless.capture("&lt;SECRET_KEY&gt;", function (request, response) {
 *         // Cloud Function code goes here
 *         response.json({ foo: "bar" });
 *     });
 *
 * </code></pre>
 *
 * To use it with Express.js, simply configure it with your routes:
 * <pre><code>
 *     var bst = require('bespoken-tools');
 *
 *     var logless = bst.Logless.middleware("&lt;SECRET_KEY&gt;");
 *     app = express();
 *
 *     app.use(bodyParser.json());
 *     app.use(logless.requestHandler);
 *
 *     // Application handlers and routers registered here
 *     app.post("/", function {
 *         ...
 *     });
 *
 *     // The Logless error handler must be registered last
 *     app.use(logless.errorHandler);
 *
 * </code></pre>
 *
 * That's all there is to it. Then you can see all your logs through our handy dashboard!
 *
 * We will effortlessly capture and format:
 * <ul>
 *     <li>Request and response payloads
 *     <li>Console output (including instrumentation for timing and all debug levels)
 *     <li>Error and stack traces
 * </ul>
 *
 */
export class Logless {
    public static Domain: string = "logless.bespoken.tools";
    private static captureConsole: boolean = false;

    /**
     * Wraps an AWS Lambda function to capture logs and diagnostics
     * @param source The secret key for your Logless app
     * @param handler
     * @returns {LambdaFunction}
     */
    public static capture(source: string, handler: Function): Function {
        if (handler === undefined || handler === null) {
            throw new Error("Handler is null or undefined! This must be passed.");
        }

        return new FunctionWrapper(source, handler).wrappingFunction();
    }

    /**
     * Returns a raw logger, for working directly with Logless
     * For advanced use-cases
     * @param source
     * @returns {LoglessContext}
     */
    public static logger(source: string): LoglessContext {
        return new LoglessContext(source);
    }

    /**
     * Returns an object to hold handlers for use in capturing logs and diagnostics with Express.js
     * @param source The secret key for your Logless app
     * @returns {LoglessMiddleware}
     */
    public static middleware(source: string): LoglessMiddleware {
        const context = new LoglessContext(source);
        if (Logless.captureConsole) {
            context.wrapConsole();
        }

        const capturePayloads = function (request: any, response: any, next: Function) {
            context.newTransactionID();
            context.log(LogType.INFO, request.body, null, ["request"]);

            Logless.wrapResponse(context, response);
            if (Logless.captureConsole) {
                context.captureConsole(function () {
                    next();
                });
            } else {
                next();
            }
        };

        const captureError = function(error: Error, request: any, response: any, next: Function) {
            context.logError(LogType.ERROR, error, null);
            next();
        };

        // Set the logger on the request handler for testability
        (<any> capturePayloads).logger = context;
        (<any> captureError).logger = context;
        return new LoglessMiddleware(capturePayloads, captureError);
    }

    /**
     * Experimental - this uses monkey-patching to trace console output associated with a transaction on ExpressJS
     * The logs that come back associated with a particular log conversation should not be considered completely reliable
     *  at this point.
     * ONLY necessary for ExpressJS.
     */
    public static enableConsoleLogging() {
        // Enables capture of console output
        Logless.captureConsole = true;
    }

    public static disableConsoleLogging() {
        // Enables capture of console output
        Logless.captureConsole = false;
    }

    /**
     * @internal
     */
    private static wrapResponse(context: LoglessContext, response: any, onFlushed?: Function): void {
        const originalEnd = response.end;
        (<any> response).end = (data: any, encoding?: string, callback?: Function): void => {
            let payload = data.toString();
            if (response.getHeader("content-type").startsWith("application/json")) {
                try {
                    payload = JSON.parse(payload);
                } catch (e) {
                    console.error("Could not parse JSON: " + payload);
                }
            }

            context.log(LogType.INFO, payload, null, ["response"]);
            originalEnd.call(response, data, encoding, callback);
            context.flush();
        };
    }
}

export class LoglessMiddleware {
    public constructor (public requestHandler: ExpressRequestHandler, public errorHandler: ExpressErrorHandler) {}
}

/**
 * Interface for AWS Node.js Lambda signature
 */
export interface LambdaFunction {
    (event: any, context: any, callback?: (error?: Error, result?: any) => void): void;
}

export interface CloudFunction {
    (request: any, response: any): void;
}

/**
 * Wraps the lambda function
 */
class FunctionWrapper {

    public constructor (private source: string, public wrappedFunction: Function) {}

    public handle(arg1: any, arg2: any, arg3: any) {
        // If the second argument is a context object, then this is a Lambda
        //  Otherwise we assume it is a Google Cloud Function
        if (arg2.awsRequestId !== undefined) {
            this.handleLambda(arg1, arg2, arg3);
        } else {
            this.handleCloudFunction(arg1, arg2);
        }
    }

    public handleLambda(event: any, context: any, callback?: Function): void {
        // Create a new logger for this context
        const logger = new LoglessContext(this.source);
        logger.onLambdaEvent(event, context, callback);

        // We put the logger on the context for testability
        context.logger = logger;

        try {
            this.wrappedFunction.call(this, event, context, logger.callback());
        } catch (e) {
            console.error(e);
            logger.flush();
            logger.cleanup();
        }
    }

    public handleCloudFunction(request, response): void {
        // Create a new logger for this context
        const logger = new LoglessContext(this.source);
        logger.onCloudFunctionEvent(request, response);

        // We put the logger on the request for testability
        request.logger = logger;

        try {
            this.wrappedFunction.call(this, request, response);
        } catch (e) {
            console.error(e);
            logger.flush();
            logger.cleanup();
        }
    }

    public wrappingFunction(): Function {
        let wrapper = this.handle.bind(this);
        return wrapper;
    }
}

export interface ExpressRequestHandler {
    (req: any, res: any, next: Function): any;
}

export interface ExpressErrorHandler {
    (err: any, req: any, res: any, next: Function): any;
}

