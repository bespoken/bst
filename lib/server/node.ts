import {Socket} from "net";
import {NodeManager} from "./node-manager";
import {Global} from "../core/global";
import {SocketHandler} from "../core/socket-handler";
import {WebhookRequest} from "../core/webhook-request";

export class Node {
    private requests: Array<WebhookRequest> = [];

    constructor(public id: string, public socketHandler: SocketHandler) {}

    public queue(request: WebhookRequest) {
        console.log("NODE " + this.id + " Forwarding called");

        // If already handling a request, wait for a reply
        if (this.handlingRequest()) {
            console.log("NODE " + this.id + " Waiting");
        } else {
            this.forward(request);
        }
        this.requests.push(request);
    }

    private forward(request: WebhookRequest): void {
        console.log("NODE " + this.id + " Forwarding");
        this.socketHandler.send(request.toTCP());
    }

    public handlingRequest(): boolean {
        return (this.requests.length > 0);
    }

    public activeRequest(): WebhookRequest {
        let request: WebhookRequest = null;
        if (this.handlingRequest()) {
            request = this.requests[0];
        }
        return request;
    }

    public onReply(message: string): void {
        let self = this;
        console.log("NODE " + this.id + " ReplyReceived");
        let request = this.activeRequest();
        request.sourceSocket.write(message);

        // Remove this request from the queue
        this.requests = this.requests.slice(1);
        // Handle the next request, if there are any
        if (this.requests.length > 0) {
            this.forward(this.activeRequest());
        }
    }
}