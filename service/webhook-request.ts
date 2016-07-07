/// <reference path="../typings/globals/node/index.d.ts" />

import * as querystring from "querystring";

export class WebhookRequest {
    private rawContents: Buffer;
    public method: string;
    public uri: string;
    public body: string;
    public headers:{ [id: string] : string };
    public queryParameters: {[id: string]: string} = {};

    public constructor() {
        this.rawContents = new Buffer("");
        this.body = "";
    }

    public static fromString(payload: string): WebhookRequest {
        let webhookRequest = new WebhookRequest();
        webhookRequest.append(Buffer.from(payload));
        return webhookRequest;
    }

    public append(data: Buffer) {
        this.rawContents = Buffer.concat([this.rawContents, data]);

        if (this.headers == null) {
            this.headers = {};
            let contentsString: string = this.rawContents.toString();
            let endIndex = contentsString.indexOf("\r\n\r\n");
            if (endIndex != -1) {
                this.parseHeaders(contentsString.substr(0, endIndex));
                if (endIndex+4 < contentsString.length) {
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
        return (this.body.length == this.contentLength());
    }

    public contentLength(): number {
        let contentLength = -1;
        if (this.headers != null) {
            let contentLengthString = this.headers["Content-Length"];
            contentLength = parseInt(contentLengthString);
        }

        return contentLength;
    }

    public isPing(): boolean {
        console.log("ISPING: " + (this.uri.indexOf("/ping") != -1));
        return (this.uri.indexOf("/ping") != -1);
    }

    private parseHeaders (headersString: string): void {
        let lines: Array<string> = headersString.split("\n");
        let requestLine = lines[0];
        let requestLineParts: Array<string> = requestLine.split(" ");
        this.method = requestLineParts[0];
        this.uri = requestLineParts[1];

        console.log("QueryString URL: " + this.uri);
        if (this.uri.indexOf('?') >= 0) {
            this.queryParameters = querystring.parse(this.uri.replace(/^.*\?/, ''));
        }

        //Handle the headers
        console.log("Request: " + requestLine);
        for (let i=1;i<lines.length;i++) {
            let headerLine: string = lines[i];
            let headerParts: Array<string> = headerLine.split(":");
            let key = headerParts[0];
            let value = headerParts[1].trim();
            this.headers[key] = value;
            //console.log("Header: " + key + "=" + value);
        }
    }

    public nodeID ():string {
        return this.queryParameters["node-id"];
    }

    //Turns the webhook HTTP request into straight TCP payload
    public toTCP (): string {
        return this.rawContents.toString();
    }
}
