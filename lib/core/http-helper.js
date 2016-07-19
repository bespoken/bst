"use strict";
class HTTPHelper {
    static response(statusCode, body) {
        let statusMessage = "OK";
        if (statusCode === 400) {
            statusMessage = "Bad Request";
        }
        else if (statusCode === 404) {
            statusMessage = "Not Found";
        }
        let responseString = "HTTP/1.0 " + statusCode + " " + statusMessage + "\r\n";
        responseString += "Content-Length: " + body.length + "\r\n\r\n";
        responseString += body;
        return responseString;
    }
}
exports.HTTPHelper = HTTPHelper;
//# sourceMappingURL=http-helper.js.map