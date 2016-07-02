import {NodeManager} from "./node-manager";
import {WebhookManager} from "./webhook-manager";
export class BespokeServer {
    private nodeManager: NodeManager;
    private webhookManager: WebhookManager;

    public constructor (private webhookPort: number, private nodePort: number) {}

    public start (): void {
        this.nodeManager = new NodeManager(this.nodePort);
        this.nodeManager.start();

        this.webhookManager = new WebhookManager(this.webhookPort);
        this.webhookManager.start();

    }
}
