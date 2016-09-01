
import * as querystring from "querystring";
import {BufferUtil} from "./buffer-util";

export class HTTPBuffer {
    public headers: { [id: string]: string } = null;
    public queryParameters: {[id: string]: string};
    public method: string;
    public rawContents: Buffer;
    public uri: string;
    public body: Buffer;

    public append(data: Buffer): void {
        this.rawContents = Buffer.concat([this.rawContents, data]);

        if (this.headers == null) {
            this.headers = {};
            let contentsString: string = this.rawContents.toString();
            let endIndex = contentsString.indexOf("\r\n\r\n");
            if (endIndex !== -1) {
                this.parseHeaders(contentsString.substr(0, endIndex));

                if (endIndex + 4 < contentsString.length) {
                    let bodyPart: string = contentsString.substr((endIndex + 4));
                    this.appendBody(Buffer.from(bodyPart));
                }
            }
        } else {
            this.appendBody(data);
        }
    }

    /**
     * Analyzes the payload to see if it has been completely received
     * For fixed-length payloads, looks at the content-length and compares that to the body length
     * For chunked payloads, looks at the buffer segments
     * @returns {boolean}
     */
    public complete (): boolean {
        let complete = false;
        if (this.headers != null) {
            // Means it is chunked
            if (this.headers["Content-Length"] == null) {

            } else {
                let length = parseInt(this.headers["Content-Length"]);
                complete = this.body.length === length;
            }
        }
        return complete;
    }

    private appendBody(bodyPart: Buffer) {
        if (this.body == null) {
            this.body = BufferUtil.fromString("");
        }
        this.body = Buffer.concat([this.body, bodyPart]);
    }

    private parseQueryString() {
        if (this.uri.indexOf("?") >= 0) {
            this.queryParameters = querystring.parse(this.uri.replace(/^.*\?/, ''));
        }
    }

    private parseHeaders(headersString: string): void {
        let lines: Array<string> = headersString.split("\n");
        let requestLine = lines[0];
        let requestLineParts: Array<string> = requestLine.split(" ");
        this.method = requestLineParts[0];
        this.uri = requestLineParts[1];

        // Handle the headers
        for (let i = 1; i < lines.length; i++) {
            let headerLine: string = lines[i];
            let headerParts: Array<string> = headerLine.split(":");
            let key = headerParts[0];
            this.headers[key] = headerParts[1].trim();
            //console.log("Header: " + key + "=" + this.headers[key]);
        }
    }
}

export class HTTPChunk {
    public length: number;
    public data: Buffer;

    public static parse (body: Buffer): Array<HTTPChunk> {
        // Find /r/n - the delimiter for the chunk length
        let index = scan(body, [13, 10]);
        return null;
    }

    // Find the specified value within the buffer
    public static scan(body: Buffer, sequence: Array<number>): number {
        let index = -1;
        for (let i = 0; i < body.length; i++) {
            let val = body[i];
            console.log(i + ": " + val);
            if (val === sequence[0]) {
                let match = true;
                for (let ii = i + 1; ii < sequence.length; ii++) {
                    if (ii >= body.length) {
                        match = false;
                        break;
                    }

                    val = body[ii];
                    if (val !== sequence[ii]) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
}
