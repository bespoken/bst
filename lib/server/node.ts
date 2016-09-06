import {SocketHandler} from "../core/socket-handler";
import {WebhookRequest} from "../core/webhook-request";
import {LoggingHelper} from "../core/logging-helper";

const Logger = "NODE";

export class Node {
    private requests: {[id: number]: WebhookRequest} = {};

    constructor(public id: string, public socketHandler: SocketHandler) {}

    public forward(request: WebhookRequest): void {
        console.log("NODE " + this.id + " MSG-ID: " + request.id() + " Forwarding");
        this.requests[request.id()] = request;
        this.socketHandler.send(request.toTCP(), request.id());
    }

    public handlingRequest(): boolean {
        return (Object.keys(this.requests).length > 0);
    }

    public onReply(message: string, messageID: number): void {
        let self = this;
        console.log("NODE " + this.id + " MSG-ID: " + messageID + " ReplyReceived");

        let request = this.requests[messageID];
        if (request === null) {
            LoggingHelper.info(Logger, "No matching messageID for reply: " + messageID);
        } else {
            request.sourceSocket.write(message, function () {
                delete self.requests[messageID];
            });
        }

    }
}