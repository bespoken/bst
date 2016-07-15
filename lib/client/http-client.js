"use strict";
const http = require("http");
class HTTPClient {
    post(host, port, path, data) {
        let post_options = {
            host: host,
            port: port,
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(data)
            }
        };
        let post_req = http.request(post_options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                console.log("Response: " + chunk);
            });
        });
        post_req.write(data);
        post_req.end();
    }
}
exports.HTTPClient = HTTPClient;
//# sourceMappingURL=http-client.js.map