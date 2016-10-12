import * as https from "http";
import {IncomingMessage} from "http";
import {ClientRequest} from "http";

export class LogQueue {
    private _queue: Array<Log> = [];
    public enqueue(log: Log) {
        this._queue.push(log);
    }

    public flush() {
        const data = {
            logs: new Array<any>()
        };

        for (let log of this._queue) {
            const message = log.message();
            const timestamp = log.timestampAsISOString();
            data.logs.push({
                message: message,
                type: LogType[log.type],
                timestamp: timestamp,
            });
        }

        const dataAsString = JSON.stringify(data);
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
    REQUEST,
    RESPONSE,
    WARN,
}

export class Log {
    public _timestamp: Date;

    public constructor(public type: LogType, public messages: Array<string>) {
        this._timestamp = new Date();
    }

    public message(): string {
        let buffer = new Buffer("");
        for (let s of this.messages) {
            buffer = Buffer.concat([buffer, new Buffer(s)]);
        }
        return buffer.toString();
    }

    public timestampAsISOString(): string {
        return this._timestamp.toISOString();
    }
}
