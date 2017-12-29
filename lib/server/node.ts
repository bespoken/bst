import {SocketHandler, SocketMessage} from "../core/socket-handler";
import {WebhookRequest} from "../core/webhook-request";
import {LoggingHelper} from "../core/logging-helper";

const Logger = "NODE";

export class Node {
    private requests: {[id: number]: WebhookRequest} = {};

    constructor(public id: string, public socketHandler: SocketHandler) {}

    public forward(request: WebhookRequest): void {
        console.log("NODE " + this.id + " MSG-ID: " + request.id() + " Forwarding");
        this.requests[request.id()] = request;
        this.socketHandler.send(new SocketMessage(request.rawContents, request.id()));
    }

    public handlingRequest(): boolean {
        return (Object.keys(this.requests).length > 0);
    }

    public onReply(socketMessage: SocketMessage): void {
        const self = this;
        console.log("NODE " + this.id + " MSG-ID: " + socketMessage.getMessageID() + " ReplyReceived");

        const request = this.requests[socketMessage.getMessageID()];
        if (request === null) {
            LoggingHelper.info(Logger, "No matching messageID for reply: " + socketMessage.getMessageID());
        } else {
            delete self.requests[socketMessage.getMessageID()];
            try {
                request.sourceSocket.write(socketMessage.getMessage());
            } catch (e) {
                LoggingHelper.error(Logger, "Error writing: " + e);
            }

        }

    }
}