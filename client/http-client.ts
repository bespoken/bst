/// <reference path="../typings/globals/node/index.d.ts" />

import * as querystring from "querystring";
import * as http from "http";

export class HTTPClient {

    public post(host: string, port: number, data: string) {
        // Build the post string from an object
        var post_data = querystring.stringify({
            'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
            'output_format': 'json',
            'output_info': 'compiled_code',
            'warning_level' : 'QUIET',
            'js_code' : data
        });

        // An object of options to indicate where to post to
        var post_options = {
            host: host,
            port: port,
            path: '/compile?node-id=10',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
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
        post_req.write(post_data);
        post_req.end();

    }
}