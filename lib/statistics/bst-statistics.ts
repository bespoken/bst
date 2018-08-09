import * as https from "https";

export const SOURCE_API_URL = "source-api-dev";

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

    record(command: string, event?: string, nodeId?: string, flushed?: (error?: Error) => void) {
        this.statisticsContext.record(command, event, nodeId);
        if (!this.timer) {
            this.statisticsContext.flush(flushed);
        }
    }
}

export class StatisticsContext {
    private _queue: Array<BstStat> = [];

    public record(command: string, event?: string, nodeId?: string) {
        this._queue.push(new BstStat(command, event, nodeId));
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
        const httpRequest = https.request(options);

        httpRequest.on("error", function(error: any) {
            console.error(error.toString());
            if (flushed !== undefined) {
                flushed(error);
            }
        });

        httpRequest.setNoDelay(true);
        httpRequest.end(dataAsString, null, function () {
            if (flushed !== undefined) {
                flushed();
            }
        });
    }
}

export class BstStat {
    public _timestamp: Date;

    public constructor(public command: string, public event?: string, public nodeId?: string) {
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
    test: "test"
};

export const BstEvent = {
    connect: "connect",
    forwarded: "forwarded",
    dropped: "dropped"
};