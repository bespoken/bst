/// <reference path="../../typings/index.d.ts" />

import * as http from "http";
import {BufferUtil} from "./buffer-util";

export class HTTPClient {

    public post(host: string, port: number, path: string, data: string, callback?: (data: Buffer, statusCode: number, success: boolean) => void) {
        // An object of options to indicate where to post to
        let post_options = {
            host: host,
            port: port,
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        // Set up the request
        let responseData: Buffer = null;
        let post_req = http.request(post_options, function(response) {
            response.setEncoding("utf8");
            response.on("data", function (chunk: Buffer) {
                if (responseData === null) {
                    responseData = chunk;
                } else {
                    responseData = Buffer.concat([responseData, chunk]);
                }
            });

            response.on("end", function () {
                if (callback !== undefined && callback !== null) {
                    callback(responseData, response.statusCode, true);
                }
            });
        });

        post_req.on("error", function (error: any) {
            if (callback !== undefined && callback !== null) {
                callback(BufferUtil.fromString(error.message), 0, false);
            }
        });
        // post the data
        post_req.write(data);
        post_req.end();
    }
}