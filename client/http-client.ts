/// <reference path="../typings/globals/node/index.d.ts" />

import * as querystring from "querystring";
import * as http from "http";

export class HTTPClient {

    public post(host: string, port: number, path: string, data: string) {
        // An object of options to indicate where to post to
        var post_options = {
            host: host,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(data);
        post_req.end();

    }
}