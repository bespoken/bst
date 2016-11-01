import {LoglessContext} from "../logless/logless-context";

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

    public static capture(source: string, handler: LambdaFunction): LambdaFunction {
        if (handler === undefined || handler === null) {
            throw new Error("Handler is null or undefined! This must be passed.");
        }

        return new LambdaWrapper(source, handler).lambdaFunction();
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
