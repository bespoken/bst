import {Socket} from "net";
import {NodeManager} from "./node-manager";
import {Global} from "../core/global";
import {SocketHandler} from "../core/socket-handler";
import {WebhookRequest} from "../core/webhook-request";

export class Node {
    private activeRequest: WebhookRequest = null;
    private sourceSocket: Socket = null;
    private onReplied: () => void = null;

    constructor(public id: string, public socketHandler: SocketHandler) {}

    public forward(sourceSocket: Socket, request: WebhookRequest) {
        let self = this;
        // If already handling a request, wait for a reply
        if (this.handlingRequest()) {
            this.onReplied = function () {
                self.forward(sourceSocket, request);
            };
        } else {
            console.log("NODE " + this.id + " Forwarding");
            this.socketHandler.send(request.toTCP());
            this.activeRequest = request;
            this.sourceSocket = sourceSocket;
        }
    }

    public handlingRequest(): boolean {
        return (this.activeRequest !== null);
    }

    public onReply(message: string): void {
        let self = this;
        console.log("NODE " + this.id + " ReplyReceived");
        this.sourceSocket.write(message, function () {
            // Reset the state of the request handling after passing along the reply
            self.sourceSocket = null;
            self.activeRequest = null;
            if (self.onReplied !== null) {
                self.onReplied();
            }
        });
    }
}