/// <reference path="../../typings/index.d.ts" />

import * as querystring from "querystring";
import {BufferUtil} from "./buffer-util";
import {Socket} from "net";

export class WebhookRequest {
    public rawContents: Buffer;
    public method: string;
    public uri: string;
    public body: string;
    public queryParameters: {[id: string]: string} = {};
    private headers: { [id: string]: string };
    private requestID: number;

    public constructor(public sourceSocket?: Socket) {
        this.rawContents = new Buffer("");
        this.body = "";
        this.requestID = new Date().getTime();
        if (this.sourceSocket === undefined) {
            this.sourceSocket = null;
        }
    }

    public static fromString(sourceSocket: Socket, payload: string, id?: number): WebhookRequest {
        let webhookRequest = new WebhookRequest(sourceSocket);
        webhookRequest.append(BufferUtil.fromString(payload));
        webhookRequest.requestID = id;
        return webhookRequest;
    }

    public append(data: Buffer) {
        this.rawContents = Buffer.concat([this.rawContents, data]);

        if (this.headers == null) {
            this.headers = {};
            let contentsString: string = this.rawContents.toString();
            let endIndex = contentsString.indexOf("\r\n\r\n");
            if (endIndex !== -1) {
                this.parseHeaders(contentsString.substr(0, endIndex));

                if (endIndex + 4 < contentsString.length) {
                    let bodyPart: string = contentsString.substr((endIndex + 4));
                    this.appendBody(bodyPart);
                }
            }
        } else {
            this.appendBody(data.toString());
        }
    }

    private appendBody(bodyPart: string) {
        this.body += bodyPart;
    }

    public done(): boolean {
        if (this.method === "GET") {
            return true;
        }

        return (this.body.length === this.contentLength());
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
            nodeValue = this.queryParameters["node-id"];
        }
        return nodeValue;
    }

    // Turns the webhook HTTP request into straight TCP payload
    public toTCP (): string {
        return this.rawContents.toString();
    }

    public toString(): string {
        return this.method + " " + this.uri;
    }

    public id(): number {
        return this.requestID;
    }
}
