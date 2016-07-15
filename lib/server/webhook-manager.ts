import {WebhookRequest} from "../core/webhook-request";
import * as net from "net";
import {Server} from "net";
import {SocketHandler} from "../core/socket-handler";
import {Socket} from "net";
import {BufferUtil} from "../core/buffer-util";

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
            let webhookRequest = new WebhookRequest();
            socket.on("data", function(data: Buffer) {
                // Throw away the pings - too much noise
                let dataString = data.toString();
                if (dataString.length > 4 && dataString.substr(0, 3) !== "GET") {
                    console.log("Webhook From " + socket.remoteAddress + ":" + socket.remotePort);
                    console.log("Webhook Payload " + BufferUtil.prettyPrint(data));
                }

                // The calling socket just seems to stay open some times
                //  Would like to force it closed but don't know when to do it
                //  If we do it on the write callback on the socket, the original caller never gets the response
                // For now, if we get a second request on the socket, re-initialize the webhookRequest
                if (webhookRequest.done()) {
                    webhookRequest = new WebhookRequest();
                }

                webhookRequest.append(data);
                if (webhookRequest.done()) {
                    if (webhookRequest.isPing()) {
                        socket.write("HTTP/1.0 200 OK\r\nContent-Length: 10\r\n\r\nbst-server");
                        socket.end();
                    } else {
                        console.log("Webhook invokeCallback");
                        self.onWebhookReceived(socket, webhookRequest);
                    }
                }
            });
        }).listen(this.port, this.host);

        console.log("WebhookServer listening on " + this.host + ":" + this.port);
    }

    public stop (): void {
        this.server.close(function () {
            console.log("WebhookManager STOP");
        });
    }
}