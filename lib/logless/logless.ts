import {LogType, LoglessContext} from "../logless/logless-context";

export interface LambdaFunction {
    (event: any, context: any, callback?: Function): void;
}

export class Logless {
    // For now there is just one global context
    //  At some point we might work in a non-stateless environment, in which case this will need to change
    private static _context: LoglessContext;
    private static _source: string;
    private static _initialized = false;

    public static capture(source: string, handler: LambdaFunction): LambdaFunction {
        Logless._source = source;
        // We call this every time, just for convenience - we assume stateless
        Logless.initialize();

        // Create a new logger for this context
        const logger = Logless.newContext();
        return new LambdaWrapper(logger, handler).lambdaFunction();
    }

    private static initialize(): void {
        if (Logless._initialized) {
            return;
        }

        Logless._initialized = true;
        Logless.wrapCall(console, "error", LogType.ERROR);
        Logless.wrapCall(console, "info", LogType.INFO);
        Logless.wrapCall(console, "log", LogType.DEBUG);
        Logless.wrapCall(console, "warn", LogType.WARN);
        process.on("uncaughtException", function (error: Error) {
            // In the case of an uncaught exception, we log it and then flush
            // This can then lead to multiple flushes, but we don't want to lose the logs if this exception
            //  caused the program to not return successfully
            console.error(error);
            Logless._context.flush();
        });
    }

    private static wrapCall(console: any, name: string, type: LogType): void {
        let originalCall = (<any> console)[name];

        let newCall: any = function (data: any, ...params: any[]) {
            if (!Logless._context.completed()) {
                Logless._context.log(type, data, params);
            }

            // Need to put it all into one array and call the function or the params are not processed correctly
            let allParams = [data];
            for (let param of params) {
                allParams.push(param);
            }
            originalCall.apply(this, allParams);
        };

        console[name] = newCall;
    }

    public static newContext(): LoglessContext {
        Logless._context = new LoglessContext(Logless._source);
        return Logless._context;
    }
}

/**
 * Wraps the lambda function
 */
export class LambdaWrapper {

    public constructor (public logger: LoglessContext, public wrappedLambda: LambdaFunction) {}

    public handle(event: any, context: any, callback?: Function): void {
        this.logger.onLambdaEvent(event, context, callback);

        try {
            this.wrappedLambda.call(this, event, context, this.logger.callback());
        } catch (e) {
            console.error(e);
            this.logger.flush();
        }
    }

    public lambdaFunction(): LambdaFunction {
        let lambda = this.handle.bind(this);
        lambda.logger = this.logger;
        return lambda;
    }
}
