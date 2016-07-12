import {Socket} from "net";
import {NodeManager} from "./node-manager";
import {Global} from "./../core/global";
import {SocketHandler} from "./../core/socket-handler";
import {WebhookRequest} from "./../core/webhook-request";

export class Node {
    private activeRequest: WebhookRequest;

    constructor(public id: string, public socketHandler: SocketHandler) {}

    public forward(sourceSocket: Socket, request: WebhookRequest) {
        let self = this;
        console.log("NODE " + this.id + " Forwarding");
        this.socketHandler.call(request.toTCP(), function(data: string) {
            console.log("NODE " + self.id + " ReplyReceived");
            sourceSocket.write(data, function() {

            });
        });

        this.activeRequest = request;
    }
}