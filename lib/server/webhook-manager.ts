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

    public start(): Promise<void> {
        let socketIndex = 0;

        const connectFunction = (socket) => {
            let webhookRequest = new WebhookRequest(socket);
            socketIndex++;
            let socketKey = socketIndex;
            this.socketMap[socketIndex] = socket;

            socket.on("data", (data: Buffer) => {
                webhookRequest.append(data);
                if (webhookRequest.done()) {
                    this.onWebhookReceived(webhookRequest);

                    // The calling socket just seems to stay open some times
                    //  Would like to force it closed but don't know when to do it
                    //  If we do it on the write callback on the socket, the original caller never gets the response
                    // For now, re-initialize the webhookRequest in case a second payload comes through
                    webhookRequest = new WebhookRequest(socket);
                }
            });

            socket.on("close", () => {
                delete this.socketMap[socketKey];
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

        return new Promise((resolve, reject) => {
            this.server.on("listening", () => {
                LoggingHelper.info(Logger, "Webhook Listening on " + this.host + ":" + this.port);
                resolve();
            });
        });
    }

    public stop (): Promise<void> {
        let self: WebhookManager = this;
        for (let key in self.socketMap) {
            let socket = self.socketMap[key];
            socket.end();
        }

        return new Promise((resolve, reject) => {
            this.server.close(function () {
                resolve();
            });
        });
    }
}