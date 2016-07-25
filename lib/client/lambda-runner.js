"use strict";
const http = require("http");
const logging_helper_1 = require("../core/logging-helper");
let Logger = "BST-LAMBDA";
class LambdaRunner {
    start(file, port) {
        let self = this;
        let server = http.createServer();
        server.listen(port);
        server.on("request", function (request, response) {
            let requestBody = "";
            request.on("data", function (chunk) {
                requestBody += chunk.toString();
            });
            request.on("end", function () {
                self.invoke(file, requestBody, response);
            });
        });
        logging_helper_1.LoggingHelper.info(Logger, "LambdaRunner started on port: " + port);
    }
    invoke(file, body, response) {
        let path = file;
        if (!path.startsWith("/")) {
            path = [process.cwd(), file].join("/");
        }
        logging_helper_1.LoggingHelper.info(Logger, "LambdaPath: " + path);
        let bodyJSON = JSON.parse(body);
        let lambda = require(path);
        let context = new LambdaContext(response);
        lambda.handler(bodyJSON, context);
    }
}
exports.LambdaRunner = LambdaRunner;
class LambdaContext {
    constructor(response) {
        this.response = response;
    }
    fail(body) {
        this.done(false, body);
    }
    succeed(body) {
        this.done(true, body);
    }
    done(success, body) {
        let statusCode = 200;
        let contentType = "application/json";
        let bodyString = null;
        if (success) {
            bodyString = JSON.stringify(body);
        }
        else {
            statusCode = 500;
            contentType = "text/plain";
        }
        this.response.writeHead(statusCode, {
            "Content-Type": contentType
        });
        if (body) {
            this.response.write(bodyString);
        }
        this.response.end();
    }
}
exports.LambdaContext = LambdaContext;
//# sourceMappingURL=lambda-runner.js.map