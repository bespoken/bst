
import {BufferUtil} from "./buffer-util";

export class HTTPBuffer {
    private _rawContent: Buffer = BufferUtil.fromString("");
    private _complete: boolean = false;

    // These values all start as undefined - their state is set as we parse the body
    //  That is because we set them as they are processed
    //  Each one may be received at different points, so want to be careful about managing state
    // They all start as undefined, and then once we know what they, they can be a value or null
    //  Null is for the case they that they do not exist - such as a body for a GET request
    //  or queryParameters where there are none
    private _chunks: Array<HTTPChunk>;
    private _headers: { [id: string]: string };
    private _method: string;
    private _rawBody: Buffer; // The body of the HTTP message - separate from the headers
    private _requestLine: string; // Only set for HTTP Requests
    private _statusCode: number;
    private _statusLine: string; // Only set for HTTP responses
    private _uri: string;

    public append(data: Buffer): void {
        this._rawContent = Buffer.concat([this._rawContent, data]);

        if (this._headers === undefined) {
            // Scan for \r\n\r\n  - indicates the end of the headers
            let endIndex = BufferUtil.scan(this._rawContent, [13, 10, 13, 10]);
            if (endIndex !== -1) {
                let headerBuffer = this._rawContent.slice(0, endIndex);
                this.parseHeaders(headerBuffer.toString());

                if (endIndex + 4 < this._rawContent.length) {
                    let bodyPart = this._rawContent.slice((endIndex + 4));
                    this.appendBody(bodyPart);
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
    public complete(): boolean {
        if (!this._complete) {
            // If we have the headers, then check the body
            if (this._headers !== undefined) {
                let chunked = this.hasHeader("Transfer-Encoding") && this.header("Transfer-Encoding").toLowerCase() === "chunked";
                if (chunked && this._rawBody !== undefined) {
                    let chunks = this.parseChunks();
                    // Only store the chunks if they are finalized
                    if (chunks !== null && chunks.length > 0 && chunks[chunks.length - 1].lastChunk()) {
                        this._chunks = chunks;
                        this._complete = true;
                    }
                } else if (this._rawBody !== undefined) {
                    // If no Content-Length is specified, we default to just the length of this portion
                    //  We do this because we are kind and forgiving
                    let length = this._rawBody.length;
                    if (this.hasHeader("Content-Length")) {
                        length = parseInt(this.header("Content-Length"));
                    }

                    this._complete = this._rawBody.length === length;
                }
            }

        }
        return this._complete;
    }

    public header(headerKey: string) {
        let value: string = null;
        if (this._headers !== undefined && this.hasHeader(headerKey)) {
            value = this._headers[headerKey];
        }
        return value;
    }

    public hasHeader(headerKey: string) {
        return headerKey in this._headers;
    }

    public method(): string {
        return this._method;
    }

    public uri(): string {
        return this._uri;
    }

    public statusCode(): number {
        return this._statusCode;
    }

    public chunked() {
        let chunked = false;
        if (this.complete()) {
            if (this._chunks !== undefined) {
                chunked = true;
            }
        }
        return chunked;
    }

    public raw(): Buffer {
        return this._rawContent;
    }

    public isJSON(): boolean {
        return this.hasHeader("Content-Type") && this.header("Content-Type") === "application/json";
    }

    // For non-chunked payloads, just returns the raw body
    // For chunked payloads, this is the assembled contents of the chunk bodies
    public body () {
        let body: Buffer;
        if (this.complete()) {
            body = BufferUtil.fromString("");
            if (this.chunked()) {
                for (let chunk of this._chunks) {
                    body = Buffer.concat([body, chunk.body]);
                }
            } else {
                body = this._rawBody;
            }
        }
        return body;
    }

    // Convenience method to return body as JSON
    public bodyAsJSON(): any {
        let json: any;
        if (this.body() !== undefined) {
            json = JSON.parse(this.body().toString());
        }
        return json;
    }

    /**
     * Parses out the chunks
     * @returns {Array<HTTPChunk>}
     */
    private parseChunks(): Array<HTTPChunk> {
        let chunks: Array<HTTPChunk> = [];
        // We will keep taking chunks out of the array with slice
        //  This is okay because Buffer.slice just changes start and end without duplicating underlying array
        let body = this._rawBody;

        // Keep looping until we either hit the final chunk (zero-length)
        //  Or we get an incomplete chunk
        while (true) {
            let chunk = HTTPChunk.parse(body);
            if (chunk !== null) {
                chunks.push(chunk);
            } else {
                // Stop if no chunk is found
                break;
            }

            if (chunk.lastChunk()) {
                // Stop if last chunk is found
                break;
            }

            body = body.slice(chunk.lengthWithHeaderAndTrailer());
        }

        return chunks;
    }

    private appendBody(bodyPart: Buffer) {
        if (this._rawBody === undefined) {
            this._rawBody = BufferUtil.fromString("");
        }
        this._rawBody = Buffer.concat([this._rawBody, bodyPart]);
    }

    private parseHeaders(headersString: string): void {
        this._headers = {};
        let lines: Array<string> = headersString.split("\n");
        // This is a response if it starts with HTTP
        if (lines[0].startsWith("HTTP")) {
            this._statusLine = lines[0];
            let statusLineParts: Array<string> = this._statusLine.split(" ");
            this._statusCode = parseInt(statusLineParts[1]);
        } else {
            this._requestLine = lines[0];
            let requestLineParts: Array<string> = this._requestLine.split(" ");
            this._method = requestLineParts[0];
            this._uri = requestLineParts[1];
        }

        // Handle the headers
        for (let i = 1; i < lines.length; i++) {
            let headerLine: string = lines[i];
            let headerParts: Array<string> = headerLine.split(":");
            let key = headerParts[0];
            this._headers[key] = headerParts[1].trim();
        }
    }
}

export class HTTPChunk {
    public constructor (public body: Buffer, public lengthString: string) {}

    public length(): number {
        return parseInt(this.lengthString, 16);
    }
    public headerLength(): number {
        return (this.lengthString).length + 2;
    }

    /**
     * The complete chunk length - includes the upfront header + trailing \r\n
     * @returns {number}
     */
    public lengthWithHeaderAndTrailer(): number {
        return this.length() + this.headerLength() + 2;
    }

    // The last chunk is the one that is zero-length
    public lastChunk(): boolean {
        return (this.length() === 0);
    }

    /**
     * Tries to parse a chunk from the body
     * Body may not be complete yet - returns null if that is the case
     * @param httpBody
     * @returns {HTTPChunk}
     */
    public static parse (httpBody: Buffer): HTTPChunk {
        let chunkLengthString = HTTPChunk.parseLength(httpBody);

        // This means we don't even have a chunk header yet
        if (chunkLengthString === null) {
            return null;
        }

        let chunkLength = parseInt(chunkLengthString, 16);
        let chunkStartIndex = chunkLengthString.length + 2; // Skip the chunk length number + /r/n to get the start of the chunk

        let endIndex = chunkStartIndex + chunkLength;
        // This will happen if not all of the chunk has arrived yet
        //  This can occur because the payload to the client may be broken up into pieces that do not align
        //  with chunk boundaries
        if (httpBody.length < endIndex) {
            return null;
        }

        let chunkBody = httpBody.slice(chunkStartIndex, chunkStartIndex + chunkLength);
        return new HTTPChunk(chunkBody, chunkLengthString);
    }

    /**
     * Finds the chunk length header in the chunk
     * It's at the start followed by \r\n
     *  Example 45\r\n
     * @param httpBody
     * @returns {number} -1 if a valid chunk length is not found
     */
    public static parseLength(httpBody: Buffer): string {
        // Find /r/n - the delimiter for the chunk length
        let index = BufferUtil.scan(httpBody, [13, 10]);
        if (index === -1) {
            return null;
        }

        let chunkLengthString = "";
        for (let i = 0; i < index; i++) {
            let char = String.fromCharCode(httpBody[i]);
            // If one of the characters is not a number - something went wrong
            if (isNaN(parseInt(char, 16))) {
                throw new RangeError("Invalid character found in chunk length - something went wrong! " + char);
            }
            chunkLengthString += String.fromCharCode(httpBody[i]);
        }
        return chunkLengthString;
    }
}
