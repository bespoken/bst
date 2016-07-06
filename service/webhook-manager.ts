import {WebhookRequest} from "./webhook-request";
import * as net from "net";
import {Server} from "net";
import {SocketHandler} from "./socket-handler";
import {Socket} from "net";

export interface WebhookReceivedCallback {
    (socket: Socket, webhookRequest: WebhookRequest): void;
}
export class WebhookManager {
    private server: Server;
    private host: string;
    public onWebhookReceived: WebhookReceivedCallback = null;

    constructor (private port: number) {
        this.host = "0.0.0.0";
    }

    public start(): void {
        let self = this;

        this.server = net.createServer(function(socket: Socket) {
            let message: string = "";
            socket.on('data', function(data: Buffer) {
                console.log('Webhook DATA ' + socket.remoteAddress);

                let webhookRequest = new WebhookRequest();
                webhookRequest.append(data);

                if (webhookRequest.done()) {
                    self.onWebhookReceived(socket, webhookRequest);
                }
            });

            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        }).listen(this.port, this.host);

        console.log('WebhookServer listening on ' + this.host + ':' + this.port);
    }
}