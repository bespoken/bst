import * as http from "http";
import {Server} from "http";
import {IncomingMessage} from "http";
import {request} from "http";
import {WebhookRequest} from "./webhook-request";

export interface WebhookReceivedCallback {
    (webhookRequest: WebhookRequest): void;
}
export class WebhookManager {
    private server: Server;
    public onWebhookReceived: WebhookReceivedCallback = null;

    constructor (private port: number) {}

    public start(): void {
        let self = this;
        this.server = http.createServer();

        this.server.on('request', function(request: IncomingMessage, response) {
            let requestBytes = [];

            //Standard stuff for reading in body of a request
            request.on('data', function(chunk) {
                requestBytes.push(chunk);
            }).on('end', function() {
                let requestString = Buffer.concat(requestBytes).toString();

                let webhookRequest = new WebhookRequest(request, requestString);
                if (self.onWebhookReceived != null) {
                    self.onWebhookReceived(webhookRequest);
                }
            });
        });

        this.server.listen(this.port);


    }
}