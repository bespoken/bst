import {LogType, LoglessContext} from "../logless/logless-context";

export interface LambdaFunction {
    (event: any, context: any, callback?: Function): void;
}

export class Logless {
    // For now there is just one global context
    //  At some point we might work in a non-stateless environment, in which case this will need to change
    private static _context: LoglessContext;
    private static _source: string;

    public static capture(source: string, handler: LambdaFunction): LambdaFunction {
        Logless._source = source;
        // We call this every time, just for convenience - we assume stateless
        Logless.initialize();

        // Create a new logger for this context
        const logger = Logless.newContext();
        return new LambdaWrapper(logger, handler).lambdaFunction();
    }

    private static initialize(): void {
        Logless.wrapCall(console, "error", LogType.ERROR);
        Logless.wrapCall(console, "info", LogType.INFO);
        Logless.wrapCall(console, "log", LogType.DEBUG);
        Logless.wrapCall(console, "warn", LogType.WARN);
    }

    private static wrapCall(console: any, name: string, type: LogType): void {
        let originalCall = (<any> console)[name];

        // If this is already wrapped, then leave it alone
        if (originalCall.wrapper !== undefined) {
            return;
        }

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
        newCall.wrapper = true;

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
            context.fail(e);
        }
    }

    public lambdaFunction(): LambdaFunction {
        let lambda = this.handle.bind(this);
        lambda.logger = this.logger;
        return lambda;
    }
}
