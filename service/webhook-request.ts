import {IncomingMessage} from "http";
import * as querystring from "querystring";

export class WebhookRequest {
    public queryParameters: {[id: string]: string} = {};
    constructor(public request: IncomingMessage, public body: string) {
        this.prepare();
    }

    private prepare (): void {
        console.log("QueryString URL: " + this.request.url);
        if (this.request.url.indexOf('?') >= 0) {
            this.queryParameters = querystring.parse(this.request.url.replace(/^.*\?/, ''));

            // do stuff
            console.log(this.queryParameters);
        }
    }

    public nodeID ():string {
        let nodeID = this.queryParameters["node-id"];
        return nodeID;
    }

    public process (): void {

    }
}
