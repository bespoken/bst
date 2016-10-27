import {LoglessContext} from "../logless/logless-context";

export interface LambdaFunction {
    (event: any, context: any, callback?: Function): void;
}

export class Logless {
    public static Domain: string = "logless.bespoken.tools";
    private static _source: string;

    public static capture(source: string, handler: LambdaFunction): LambdaFunction {
        if (handler === undefined || handler === null) {
            throw new Error("Handler is null or undefined! This must be passed.");
        }

        Logless._source = source;
        return new LambdaWrapper(handler).lambdaFunction();
    }

    public static newContext(): LoglessContext {
        return new LoglessContext(Logless._source);
    }
}

/**
 * Wraps the lambda function
 */
export class LambdaWrapper {

    public constructor (public wrappedLambda: LambdaFunction) {}

    public handle(event: any, context: any, callback?: Function): void {
        // Create a new logger for this context
        const logger = Logless.newContext();

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
