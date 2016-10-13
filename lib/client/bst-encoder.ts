/**
 * Created by jpk on 10/13/16.
 */

import {FileUtil} from "../core/file-util";
import * as path from "path";
import * as http from "http";
import {IncomingMessage} from "http";
const AWS = require("aws-sdk");

export interface AWSEncoderConfig {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}

/**
 * Encodes an audio file for use in SSML of OutputSpeech
 *
 * Once encoded it uploads it to S3
 */
export class BSTEncoder {
    private static EncoderHost = "elb-ecs-bespokenencoder-dev-299768275.us-east-1.elb.amazonaws.com";
    private static EncoderPath = "/encode";

    private _awsConfiguration: AWSEncoderConfig;

    public constructor(awsConfiguration?: AWSEncoderConfig) {
        this._awsConfiguration = awsConfiguration;
    }

    /**
     *
     * @param filePath
     * @param callback
     */
    public encodeAndPublishFile(filePath: string, callback: (error: Error, encodedURL: string) => void): void {
        const self = this;
        FileUtil.readFile(filePath, function(data: Buffer) {
            const fp = path.parse(filePath);
            const filename = fp.name + fp.ext;
            self.uploadFile(self._awsConfiguration.bucket, filename, data, function (url: string) {
                self.callEncode(url, function(error: Error, encodedURL: string) {
                    callback(error, encodedURL);
                });
            });
        });
    }

    public encodeAndPublishURL(url: string, callback: (error: Error, encodedURL: string) => void): void {
        const self = this;
        self.callEncode(url, function(error: Error, encodedURL: string) {
            callback(error, encodedURL);
        });
    }

    private uploadFile(bucket: string, name: string, data: Buffer, callback: (uploadedURL: string) => void) {
        const self = this;
        if (this._awsConfiguration === undefined) {
            throw new Error("No AWS Configuration parameters defined");
        }

        const credentials = {
            accessKeyId: this._awsConfiguration.accessKeyId,
            secretAccessKey: this._awsConfiguration.secretAccessKey
        };

        const config = {
            credentials: credentials,
            region: this._awsConfiguration.region
        };

        const s3 = new AWS.S3(config);

        const params = {Bucket: bucket, Key: name, Body: data, ACL: "public-read"};
        s3.putObject(params, function (error: Error, data: Buffer) {
            callback(self.urlForS3(self.region(), bucket, name));
        });
    }

    private callEncode(sourceURL: string, callback: (error: Error, encodedURL: string) => void) {
        const self = this;
        let filename = sourceURL.substring(sourceURL.lastIndexOf("/") + 1);
        if (filename.indexOf("?") !== -1) {
            filename = filename.substring(0, filename.indexOf("?"));
        }

        const basename = filename.substring(0, filename.indexOf("."));
        const newFilename = basename + "-encoded.mp3";

        const options = {
            host: BSTEncoder.EncoderHost,
            path: BSTEncoder.EncoderPath,
            method: "POST",
            headers: {
                accessKeyId: this._awsConfiguration.accessKeyId,
                accessSecretKey: this._awsConfiguration.secretAccessKey,
                sourceURL: sourceURL,
                targetBucket: this.bucket(),
                targetKey: newFilename
            }
        };

        let responseData = "";
        const request = http.request(options, function (response: IncomingMessage) {
            if (response.statusCode !== 200) {
                callback(new Error(response.statusMessage), null);
            } else {
                response.on("data", function(data: Buffer) {
                    responseData += data.toString();
                });

                response.on("end", function () {
                    const officialURL = self.urlForS3(self.region(), self.bucket(), newFilename);
                    callback(null, officialURL);
                });
            }
        });

        request.end();
    }

    private region(): string {
        let region = this._awsConfiguration.region;
        if (region === undefined || region === null) {
            region = "us-east-1";
        }
        return region;
    }

    private bucket(): string {
        return this._awsConfiguration.bucket;
    }

    private urlForS3(region: string, bucket: string, key: string) {
        return "https://s3.dualstack." + region + ".amazonaws.com/" + bucket + "/" + key;
    }
}