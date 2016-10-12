import * as https from "http";
import {IncomingMessage} from "http";
import {ClientRequest} from "http";
import {Logless} from "./logless";

export class LogQueue {
    private _queue: Array<Log> = [];

    public constructor(private logless: Logless) {}
    public enqueue(log: Log) {
        this._queue.push(log);
    }

    public flush() {
        const logBatch = {
            source: this.logless.source(),
            transactionID: this.logless.transactionID(),
            logs: new Array<any>()
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

    public dataAsString(): string {
        let buffer = new Buffer("");
        for (let b of this.data) {
            buffer = Buffer.concat([buffer, b]);
        }
        return buffer.toString();
    }

    public timestampAsISOString(): string {
        return this._timestamp.toISOString();
    }
}
