import * as querystring from "querystring";
import {Socket} from "net";

export class WebhookRequest {
    public rawContents: Buffer;
    public method: string;
    public uri: string;
    public body: string;
    public rawBody: Buffer;
    public queryParameters: {[id: string]: string | string[]} = {};
    public headers: { [id: string]: string };
    private requestID: number;

    public constructor(public sourceSocket?: Socket) {
        this.rawContents = new Buffer("");
        this.rawBody = new Buffer("");
        this.body = "";
        this.requestID = new Date().getTime();
        if (this.sourceSocket === undefined) {
            this.sourceSocket = null;
        }
    }

    public static fromBuffer(sourceSocket: Socket, payload: Buffer, id?: number): WebhookRequest {
        const webhookRequest = new WebhookRequest(sourceSocket);
        webhookRequest.append(payload);
        webhookRequest.requestID = id;
        return webhookRequest;
    }

    public append(data: Buffer) {
        this.rawContents = Buffer.concat([this.rawContents, data]);
        if (this.headers == null) {
            this.headers = {};
            const endIndex = this.rawContents.indexOf("\r\n\r\n");
            if (endIndex !== -1) {
                this.parseHeaders(this.rawContents.slice(0, endIndex).toString());

                if (endIndex + 4 < this.rawContents.length) {
                    const bodyPart: Buffer = this.rawContents.slice((endIndex + 4));
                    this.appendBody(bodyPart);
                }
            }
        } else {
            this.appendBody(data);
        }
    }

    public appendBody(bodyPart: Buffer) {
        this.rawBody = Buffer.concat([this.rawBody, bodyPart]);
        this.body += bodyPart.toString();
    }

    public done(): boolean {
        if (this.method === "GET") {
            return true;
        }

        return (this.rawBody.length === this.contentLength());
    }

    public contentLength(): number {
        let contentLength = -1;
        if (this.headers != null) {
            let contentLengthString = this.headers["content-length"];
            contentLength = parseInt(contentLengthString);
        }

        return contentLength;
    }

    public isPing(): boolean {
        return (this.uri.indexOf("/ping") !== -1);
    }

    private parseHeaders (headersString: string): void {
        let lines: Array<string> = headersString.split("\n");
        let requestLine = lines[0];
        let requestLineParts: Array<string> = requestLine.split(" ");
        this.method = requestLineParts[0];
        this.uri = requestLineParts[1];

        if (this.uri.indexOf("?") >= 0) {
            const qs = this.uri.replace(/^.*\?/, "");
            this.queryParameters = querystring.parse(qs);
        }

        // Handle the headers
        for (let i = 1; i < lines.length; i++) {
            let headerLine: string = lines[i];
            let headerParts: Array<string> = headerLine.split(":");
            let key = headerParts[0].toLowerCase();
            this.headers[key] = headerParts[1].trim();
        }
    }

    public nodeID (): string {
        let nodeValue: string = null;
        if ("node-id" in this.queryParameters) {
            if (typeof this.queryParameters["node-id"] === "string") {
                nodeValue = this.queryParameters["node-id"] as string;
            } else {
               throw new Error("Only one node-id should be present in the query");
            }
        }
        return nodeValue;
    }

    private removeBespokenQueries(httpLine: string): string {
        return httpLine.replace("&node-id=" + this.nodeID(), "")
            .replace("node-id=" + this.nodeID(), "")
            .replace("&bespoken-key=" + this.nodeID(), "")
            .replace("bespoken-key=" + this.nodeID(), "")
            .replace("? HTTP", " HTTP"); // in case the only parameters were bespoken ones
    }

    public requestWithoutBespokenData(): Buffer {
        const firstLineBreak = this.rawContents.indexOf("\n");
        const httpLine = this.rawContents.slice(0, firstLineBreak).toString();
        return Buffer.concat([Buffer.from(this.removeBespokenQueries(httpLine)),
            this.rawContents.slice(firstLineBreak)]);
    }

    public isJSON(): boolean {
        try {
            JSON.parse(this.body);
            return true;
        } catch (error) {
            return false;
        }
    }

    public toString(): string {
        return this.method + " " + this.uri;
    }

    public id(): number {
        return this.requestID;
    }
}
