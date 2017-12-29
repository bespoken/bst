/**
 * Created by jpk on 10/13/16.
 */

import {FileUtil} from "../core/file-util";
import * as path from "path";
import * as https from "https";
import {IncomingMessage} from "http";
const AWS = require("aws-sdk");

export interface IEncoderConfig {
    /** AWS Bucket to which the encoded file will be uploaded. */
    bucket: string;

    /** Access key with permissions for the AWS bucket. Default AWS SDK configuration is used if not set. */
    accessKeyId: string;

    /** Secret access key with permissions for the AWS bucket. Default AWS SDK configuration is used if not set. */
    secretAccessKey: string;

    /**
     * Volume multiplier: 2.0 means double the volume, 0.5 means to cut it in half.
     *
     * By default, the volume is not modified.
     */
    filterVolume?: number;
}

/**
 * Encodes an audio file so that it can be used in Alexa responses, as part of an &lt;audio&gt; tag in an SSML response.
 *
 * Allows for the use of pre-recorded audio in "regular" (i.e., non-AudioPlayer) skills. More info [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/handling-requests-sent-by-alexa#h2_pre-recorded-audio).
 *
 * Once the audio is encoded, BSTEncode uploads it to S3 so it is accessible to Alexa.
 *
 * Audio is encoded in compliance with [Alexa standards]{@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference}:
 * MP3, 48 kbps, 16000 hz
 */
export class BSTEncode {
    private static EncoderHost = "encoder.bespoken.io";
    private static EncoderPath = "/encode";

    private _configuration: IEncoderConfig;

    /**
     * The [configuration]{@link IEncoderConfig} contains AWS credentials and S3 bucket to upload to
     * It also contains the volume parameter - for manipulating the volume of the encoded file
     * @param configuration
     */
    public constructor(configuration: IEncoderConfig) {
        this._configuration = configuration;
        if (configuration.accessKeyId === undefined) {
            configuration.accessKeyId = AWS.config.credentials.accessKeyId;
            configuration.secretAccessKey = AWS.config.credentials.secretAccessKey;
        }
    }

    /**
     * Encodes a file and publishes it to S3
     * @param filePath
     * @param callback Returns the URL of the encoded file on S3. Error if there is any.
     */
    public encodeFileAndPublish(filePath: string, callback: (error: Error, encodedURL: string) => void): void {
        this.encodeFileAndPublishAs(filePath, null, callback);
    }

    /**
     * Encodes a file and publishes it to S3
     * @param filePath
     * @param outputKey The key to publish this as on S3
     * @param callback Returns the URL of the encoded file on S3. Error if there is any.
     */
    public encodeFileAndPublishAs(filePath: string, outputKey: string, callback: (error: Error, encodedURL: string) => void): void {
        const self = this;
        FileUtil.readFile(filePath, function(data: Buffer) {
            const fp = path.parse(filePath);
            const filename = fp.name + fp.ext;
            self.uploadFile(self._configuration.bucket, filename, data, function (url: string) {
                self.callEncode(url, outputKey, function(error: Error, encodedURL: string) {
                    callback(error, encodedURL);
                });
            });
        });
    }

    /**
     * Encodes a URL and publishes it to S3
     * @param sourceURL The URL of the file to encode
     * @param callback Returns the URL of the encoded file on S3. Error if there is any.
     */
    public encodeURLAndPublish(sourceURL: string, callback: (error: Error, encodedURL: string) => void): void {
        this.encodeURLAndPublishAs(sourceURL, null, callback);
    }

    /**
     * Encodes a URL and publishes it to S3 as the specified key
     * @param sourceURL The URL of the file to encode
     * @param outputKey The key to publish this as on S3
     * @param callback Returns the URL of the encoded file on S3. Error if there is any.
     */
    public encodeURLAndPublishAs(sourceURL: string, outputKey: string, callback: (error: Error, encodedURL: string) => void): void {
        const self = this;
        self.callEncode(sourceURL, outputKey, function(error: Error, encodedURL: string) {
            callback(error, encodedURL);
        });
    }

    private uploadFile(bucket: string, name: string, data: Buffer, callback: (uploadedURL: string) => void) {
        if (this._configuration === undefined) {
            throw new Error("No AWS Configuration parameters defined");
        }

        const config = {
            credentials: {
                accessKeyId: this._configuration.accessKeyId,
                secretAccessKey: this._configuration.secretAccessKey
            }
        };

        const s3 = new AWS.S3(config);

        const params = {Bucket: bucket, Key: name, Body: data, ACL: "public-read"};
        s3.putObject(params, function () {
            callback(BSTEncode.urlForS3(bucket, name));
        });
    }

    private callEncode(sourceURL: string, bucketKey: string, callback: (error: Error, encodedURL: string) => void) {
        const self = this;

        if (bucketKey === null) {
            bucketKey = sourceURL.substring(sourceURL.lastIndexOf("/") + 1);
            if (bucketKey.indexOf("?") !== -1) {
                bucketKey = bucketKey.substring(0, bucketKey.indexOf("?"));
            }

            const basename = bucketKey.substring(0, bucketKey.indexOf("."));
            bucketKey = basename + "-encoded.mp3";
        }

        const options = {
            host: BSTEncode.EncoderHost,
            path: BSTEncode.EncoderPath,
            method: "POST",
            headers: {
                accessKeyId: this._configuration.accessKeyId,
                accessSecretKey: this._configuration.secretAccessKey,
                sourceURL: sourceURL,
                targetBucket: this.bucket(),
                targetKey: bucketKey
            }
        };

        if (this._configuration.filterVolume !== undefined) {
            (<any> options.headers).filterVolume = this._configuration.filterVolume + "";
        }

        let responseData = "";
        const request = https.request(options, function (response: IncomingMessage) {
            if (response.statusCode !== 200) {
                callback(new Error(response.statusMessage), null);
            } else {
                response.on("data", function(data: Buffer) {
                    responseData += data.toString();
                });

                response.on("end", function () {
                    const officialURL = BSTEncode.urlForS3(self.bucket(), bucketKey);
                    callback(null, officialURL);
                });
            }
        });

        request.end();
    }

    private bucket(): string {
        return this._configuration.bucket;
    }

    private static urlForS3(bucket: string, key: string) {
        return "https://s3.amazonaws.com/" + bucket + "/" + key;
    }
}