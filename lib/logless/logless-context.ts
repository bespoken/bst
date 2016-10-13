import * as https from "http";
const uuid = require("uuid");
import {IncomingMessage} from "http";
import {ClientRequest} from "http";

export class LoglessContext {
    private _callback: Function;
    private _queue: Array<Log> = [];
    private _transactionID: string;

    public constructor(private _source: string) {

    }

    public onLambdaEvent(event: any, context: any, wrappedCallback: Function): void {
        const self = this;
        if (context.awsRequestId !== undefined && context.awsRequestId !== null) {
            this._transactionID = context.awsRequestId;
        } else {
            this._transactionID = uuid.v4();
        }

        const done = context.done;
        context.done = function(error: any, result: any) {
            self.captureResponse(error, result);
            self.flush();
            done(error, result);
        };

        const fail = context.fail;
        context.fail = function(error: any) {
            self.captureResponse(error, null);
            self.flush();
            fail(error);
        };

        const succeed = context.succeed;
        context.succeed = function(result: any) {
            self.captureResponse(null, result);
            self.flush();
            succeed(result);
        };

        // Capture the request event
        this.log(LogType.INFO, [event], ["request"]);

        if (wrappedCallback !== undefined && wrappedCallback !== null) {
            this._callback = function(error: any, result: any) {
                self.captureResponse(error, result);
                self.flush();
                wrappedCallback.call(this, error, result);
            };
        }
    }

    public callback(): Function {
        return this._callback;
    }

    public log(type: LogType, data: Array<any>, tags?: Array<string>) {
        this._queue.push(new Log(type, data, tags));
    }

    public source(): string {
        return this._source;
    }

    private captureResponse(error: Error, result: any) {
        if (error !== undefined && error !== null) {
            this.log(LogType.ERROR, [error.message]);
        } else {
            this.log(LogType.INFO, [result], ["response"]);
        }
    }

    public transactionID(): string {
        return this._transactionID;
    }

    public flush() {
        const logBatch = {
            source: this._source,
            transactionID: this.transactionID(),
            logs: new Array()
        };

        for (let log of this._queue) {
            const timestamp = log.timestampAsISOString();
            let payload = log.data;
            if (payload.length === 1) {
                payload = log.data[0];
            }

            const logJSON: any = {
                payload: payload,
                type: LogType[log.type],
                timestamp: timestamp,
            };

            if (log.tags !== undefined && log.tags !== null) {
                logJSON.tags = log.tags;
            }

            logBatch.logs.push(logJSON);
        }

        const dataAsString = JSON.stringify(logBatch);
        const dataLength = Buffer.byteLength(dataAsString);
        const options = {
            host: "logless.io",
            port: 443,
            path: "/capture",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": dataLength
            }
        };

        // Set up the request
        const httpRequest = this.httpRequest(options, function(response: IncomingMessage) {
            response.setEncoding("utf8");
            response.on("data", function (chunk: Buffer) {
                console.log("Response: " + chunk);
            });
        });

        // Post the data
        httpRequest.write(dataAsString);
        httpRequest.end();
    }

    public httpRequest(options: any, callback: (response: IncomingMessage) => void): ClientRequest {
        return https.request(options, callback);
    }
}

export enum LogType {
    DEBUG,
    ERROR,
    INFO,
    TRACE,
    WARN,
}

export class Log {
    public _timestamp: Date;

    public constructor(public type: LogType, public data: Array<any>, public tags?: Array<string>) {
        this._timestamp = new Date();
    }

    public timestampAsISOString(): string {
        return this._timestamp.toISOString();
    }
}
