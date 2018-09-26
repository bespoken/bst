import * as http from "http";
import * as https from "https";

const getSecureSourceApiEndPoint = () => {
    const envValue = process.env.SECURE_SOURCE_API_END_POINT;
    if (envValue && envValue === "false") {
        return false;
    }
    return true;
};
const SECURE_SOURCE_API_END_POINT = getSecureSourceApiEndPoint();
export const SOURCE_API_URL = process.env.SOURCE_API_URL || "source-api.bespoken.tools";

export class BstStatistics {
    static FLUSH_TIME = 10000;
    static singleton: BstStatistics;

    statisticsContext: StatisticsContext;
    timer: any;

    constructor() {
        this.statisticsContext = new StatisticsContext();
    }

    static instance() {
        if (!BstStatistics.singleton) {
            BstStatistics.singleton = new BstStatistics();
        }
        return BstStatistics.singleton;
    }

    start() {
        const that = this;
        this.timer = setInterval(function() {
            that.statisticsContext.flush();
        }, BstStatistics.FLUSH_TIME);
    }

    stop() {
        clearInterval(this.timer);
    }

    record(command: string, event?: string, nodeId?: string, version?: string, flushed?: (error?: Error) => void) {
        this.statisticsContext.record(command, event, nodeId, version);
        if (!this.timer) {
            this.statisticsContext.flush(flushed);
        }
    }
}

export class StatisticsContext {
    private _queue: Array<BstStat> = [];

    public record(command: string, event?: string, nodeId?: string, version?: string) {
        this._queue.push(new BstStat(command, event, nodeId, version));
    }

    public flush(flushed?: (error?: Error) => void) {
        const bstStatsBatch = new Array();

        for (let bstStat of this._queue) {
            if (bstStat &&  bstStat.command) {
                bstStatsBatch.push(bstStat);
            }
        }

        if (bstStatsBatch.length) {
            this.transmit(bstStatsBatch, flushed);

            // Clear the queue
            this._queue = [];
        }

    }

    public transmit(logBatch: any, flushed?: (error?: Error) => void)  {
        if (process.env.SKIP_STATISTICS === "true") {
            return;
        }
        const dataAsString = JSON.stringify({bstStats: logBatch});
        const dataLength = Buffer.byteLength(dataAsString);
        const options = {
            host: SOURCE_API_URL,
            path: "/v1/postBstStats",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": dataLength,
                "Connection": "keep-alive"
            }
        };

        const functionCallback = function(response) {
            response.on("data", function (chunk: Buffer) {
                responseData = Buffer.concat([responseData, chunk]);
            });
            response.on("end", function () {
                if (flushed !== undefined && flushed !== null) {
                    flushed();
                }
            });
        };

        let responseData: Buffer = new Buffer("");
        const httpRequest = SECURE_SOURCE_API_END_POINT ?
            https.request(options, functionCallback) :
            http.request(options, functionCallback);

        httpRequest.on("error", function (error: any) {
            if (process.env.DISPLAY_STATISTICS_ERROR) {
                console.log("error", error);
            }
            if (flushed !== undefined && flushed !== null) {
                flushed(error);
            }
        });
        httpRequest.setNoDelay(true);
        httpRequest.write(dataAsString);
        httpRequest.end();
    }
}

export class BstStat {
    public _timestamp: Date;

    public constructor(public command: string, public event?: string, public nodeId?: string, public version?: string) {
        this._timestamp = new Date();
    }

    public timestampAsISOString(): string {
        return this._timestamp.toISOString();
    }
}

export const BstCommand = {
    utter: "utter",
    intend: "intend",
    speak: "speak",
    proxy: "proxy",
    test: "test",
    launch: "launch"
};

export const BstEvent = {
    connect: "connect",
    forwarded: "forwarded",
    dropped: "dropped"
};