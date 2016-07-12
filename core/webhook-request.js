"use strict";
const querystring = require("querystring");
class WebhookRequest {
    constructor() {
        this.queryParameters = {};
        this.rawContents = new Buffer("");
        this.body = "";
    }
    static fromString(payload) {
        let webhookRequest = new WebhookRequest();
        webhookRequest.append(Buffer.from(payload));
        return webhookRequest;
    }
    append(data) {
        this.rawContents = Buffer.concat([this.rawContents, data]);
        if (this.headers == null) {
            this.headers = {};
            let contentsString = this.rawContents.toString();
            let endIndex = contentsString.indexOf("\r\n\r\n");
            if (endIndex !== -1) {
                this.parseHeaders(contentsString.substr(0, endIndex));
                if (endIndex + 4 < contentsString.length) {
                    let bodyPart = contentsString.substr((endIndex + 4));
                    this.appendBody(bodyPart);
                }
            }
        }
        else {
            this.appendBody(data.toString());
        }
    }
    appendBody(bodyPart) {
        this.body += bodyPart;
    }
    done() {
        if (this.method === "GET") {
            return true;
        }
        return (this.body.length === this.contentLength());
    }
    contentLength() {
        let contentLength = -1;
        if (this.headers != null) {
            let contentLengthString = this.headers["Content-Length"];
            contentLength = parseInt(contentLengthString);
        }
        return contentLength;
    }
    isPing() {
        return (this.uri.indexOf("/ping") !== -1);
    }
    parseHeaders(headersString) {
        let lines = headersString.split("\n");
        let requestLine = lines[0];
        let requestLineParts = requestLine.split(" ");
        this.method = requestLineParts[0];
        this.uri = requestLineParts[1];
        if (this.uri.indexOf("?") >= 0) {
            this.queryParameters = querystring.parse(this.uri.replace(/^.*\?/, ""));
        }
        for (let i = 1; i < lines.length; i++) {
            let headerLine = lines[i];
            let headerParts = headerLine.split(":");
            let key = headerParts[0];
            this.headers[key] = headerParts[1].trim();
        }
    }
    nodeID() {
        return this.queryParameters["node-id"];
    }
    toTCP() {
        return this.rawContents.toString();
    }
    toString() {
        return this.method + " " + this.uri;
    }
}
exports.WebhookRequest = WebhookRequest;
//# sourceMappingURL=webhook-request.js.map