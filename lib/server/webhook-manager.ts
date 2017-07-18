import {WebhookRequest} from "../core/webhook-request";
import {Server} from "net";
import * as http from "http";
import * as https from "https";
import {LoggingHelper} from "../core/logging-helper";
import {Socket} from "net";

let Logger = "WEBHOOK";

export interface WebhookReceivedCallback {
    (webhookRequest: WebhookRequest): void;
}

export class WebhookManager {
    private server: Server;
    private host: string;
    private socketMap: {[id: number]: Socket} = {};
    public onWebhookReceived: WebhookReceivedCallback = null;

    constructor (private port: number) {
        this.host = "0.0.0.0";
    }

    public start(started?: () => void): void {
        let self = this;

        let socketIndex = 0;

        const connectFunction = function(socket) {
            let webhookRequest = new WebhookRequest(socket);
            socketIndex++;
            let socketKey = socketIndex;
            self.socketMap[socketIndex] = socket;

            socket.on("data", function(data: Buffer) {
                webhookRequest.append(data);
                if (webhookRequest.done()) {
                    self.onWebhookReceived(webhookRequest);

                    // The calling socket just seems to stay open some times
                    //  Would like to force it closed but don't know when to do it
                    //  If we do it on the write callback on the socket, the original caller never gets the response
                    // For now, re-initialize the webhookRequest in case a second payload comes through
                    webhookRequest = new WebhookRequest(socket);
                }
            });

            socket.on("close", function () {
                delete self.socketMap[socketKey];
            });

        };

        if (!process.env.SSL_CERT) {
            this.server = http.createServer().listen(this.port);
            this.server.on("connection", connectFunction);
        } else {
            const cert = process.env.SSL_CERT as string;
            const key = process.env.SSL_KEY as string;

            const credentials = {
                cert: cert.replace(/\\n/g, "\n"),
                key: key.replace(/\\n/g, "\n"),
            };

            const httpsServer = https.createServer(credentials);
            this.server = httpsServer.listen(this.port, this.host);
            this.server.on("secureConnection", connectFunction);
        }

        this.server.on("listening", function () {
            if (started !== undefined && started !== null) {
                started();
            }
        });
        LoggingHelper.info(Logger, "Listening on " + this.host + ":" + this.port);
    }

    public stop (callback?: () => void): void {
        let self: WebhookManager = this;
        for (let key in self.socketMap) {
            let socket = self.socketMap[key];
            socket.end();
        }

        this.server.close(function () {
            if (callback !== undefined && callback !== null) {
                callback();
            }
        });
    }
}