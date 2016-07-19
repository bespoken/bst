export class HTTPHelper {
    /**
     * Wraps a payload as an HTTP response
     * Includes the content-length header and assumes 200 status code
     * @param body
     */
    public static response(statusCode: number, body: string): string {
        let statusMessage = "OK";
        if (statusCode === 400) {
            statusMessage = "Bad Request";
        } else if (statusCode === 404) {
            statusMessage = "Not Found";
        }

        let responseString = "HTTP/1.0 " + statusCode + " " + statusMessage + "\r\n";
        responseString += "Content-Length: " + body.length + "\r\n\r\n";
        responseString += body;
        return responseString;
    }
}

