import * as http from "http";
import * as https from "https";
import {BufferUtil} from "./buffer-util";

export class HTTPClient {

    public postWithExtraHeaders(host: string, port: number, path: string, data: string, extraHeaders: any, callback?: (data: Buffer, statusCode: number, success: boolean) => void) {
        // An object of options to indicate where to post to
        let post_options = {
            agent: false,
            host: host,
            port: port,
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        post_options.headers = Object.assign({}, post_options.headers, extraHeaders);

        const functionCallback = function(response) {
            response.on("data", function (chunk: Buffer) {
                responseData = Buffer.concat([responseData, chunk]);
            });

            response.on("end", function () {
                if (callback !== undefined && callback !== null) {
                    callback(responseData, response.statusCode, true);
                }
            });
        };
        // Set up the request
        let responseData: Buffer = new Buffer("");
        let post_req = port === 443 ?
            https.request(post_options, functionCallback) :
            http.request(post_options, functionCallback);

        post_req.on("error", function (error: any) {
            if (callback !== undefined && callback !== null) {
                callback(BufferUtil.fromString(error.message), 0, false);
            }
        });
        // post the data
        post_req.write(data);
        post_req.end();
    }

    public post(host: string, port: number, path: string, data: string, callback?: (data: Buffer, statusCode: number, success: boolean) => void) {
        this.postWithExtraHeaders(host, port, path, data, {}, callback);
    }

    public get(host: string, port: number, path: string, callback?: (data: Buffer, statusCode: number) => void) {
        // An object of options to indicate where to post to
        let options = {
            host: host,
            port: port,
            path: path,
            method: "GET"
        };

        // Set up the request
        let responseData: Buffer = new Buffer("");
        let request = http.request(options, function(response) {
            response.on("data", function (chunk: Buffer) {
                responseData = Buffer.concat([responseData, chunk]);
            });

            response.on("end", function () {
                if (callback !== undefined && callback !== null) {
                    callback(responseData, response.statusCode);
                }
            });
        });

        // get the data

        request.end();
    }
}