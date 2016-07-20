"use strict";
class HTTPHelper {
    static format(statusCode, body) {
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
    static respond(socket, statusCode, body) {
        let s = HTTPHelper.format(statusCode, body);
        socket.write(s);
        socket.end();
    }
}
exports.HTTPHelper = HTTPHelper;
//# sourceMappingURL=http-helper.js.map