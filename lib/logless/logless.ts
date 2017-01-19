import {LoglessContext} from "../logless/logless-context";
import {Response} from "~express/lib/response";
import {LogType} from "./logless-context";
import {RequestHandler} from "~express/lib/router/index";

/**
 * Logless will automatically capture logs and diagnostics for your Node.js Lambda.
 *
 * To use it, simply wrap your function handler, like so:
 * <pre><code>
 *     var bst = require('bespoken-tools');
 *
 *     exports.handler = bst.Logless.capture("&lt;SOURCE_ID&gt;", function (event, context) {
 *         // Lambda code goes here
 *         context.done(null, "Hello World");
 *     });
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

    public static capture(source: string, handler: LambdaFunction): LambdaFunction {
        if (handler === undefined || handler === null) {
            throw new Error("Handler is null or undefined! This must be passed.");
        }

        return new LambdaWrapper(source, handler).lambdaFunction();
    }

    public static captureExpress(source: string): RequestHandler {
        const context = new LoglessContext(source);
        if (Logless.captureConsole) {
            context.wrapConsole();
        }

        const captured = function (request: any, response: Response, next: Function) {
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

        // Set the logger on the request handler for testability
        (<any> captured).logger = context;
        return captured;
    }

    public static enableConsole() {
        // Enables capture of console output
        Logless.captureConsole = true;
    }

    private static wrapResponse(context: LoglessContext, response: Response, onFlushed?: Function): void {
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

/**
 * Interface for AWS Node.js Lambda signature
 */
export interface LambdaFunction {
    (event: any, context: any, callback?: (error?: Error, result?: any) => void): void;
}

/**
 * Wraps the lambda function
 */
class LambdaWrapper {

    public constructor (private source: string, public wrappedLambda: LambdaFunction) {}

    public handle(event: any, context: any, callback?: Function): void {
        // Create a new logger for this context
        const logger = new LoglessContext(this.source);
        context.logger = logger;
        logger.onLambdaEvent(event, context, callback);

        try {
            this.wrappedLambda.call(this, event, context, logger.callback());
        } catch (e) {
            console.error(e);
            logger.flush();
            logger.cleanup();
        }
    }

    public lambdaFunction(): LambdaFunction {
        let lambda = this.handle.bind(this);
        return lambda;
    }
}
