import * as http from "http";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Server} from "http";
import {LoggingHelper} from "../core/logging-helper";

let Logger = "BST-LAMBDA";

export class LambdaRunner {
    public start (file: string, port: number): void {
        let self = this;
        let server = http.createServer();
        server.listen(port);
        server.on("request", function(request: IncomingMessage, response: ServerResponse) {
            let requestBody: string = "";
            request.on("data", function(chunk: Buffer) {
                requestBody += chunk.toString();
            });

            request.on("end", function () {
                self.invoke(file, requestBody, response);
            });
        });

        LoggingHelper.info(Logger, "LambdaRunner started on port: " + port);
    }

    public invoke (file: string, body: string, response: ServerResponse): void {
        let path: string = file;
        if (!path.startsWith("/")) {
            path = [process.cwd(), file].join("/");
        }

        LoggingHelper.info(Logger, "LambdaPath: " + path);
        let bodyJSON: any = JSON.parse(body);
        let lambda: any = require(path);
        // let lambda = System.import("./" + file);
        let context: LambdaContext = new LambdaContext(response);
        lambda.handler(bodyJSON, context);
    }
}

export class LambdaContext {
    public constructor(public response: ServerResponse) {}

    public fail(body: any) {
        this.done(false, body);
    }

    public succeed(body: any) {
        this.done(true, body);
    }

    private done(success: boolean, body: any) {
        let statusCode: number = 200;
        let contentType: string = "application/json";
        let bodyString: string = null;

        if (success) {
            bodyString = JSON.stringify(body);
        } else {
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
