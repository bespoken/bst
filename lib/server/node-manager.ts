import * as net from "net";
import {Node} from "./node";
import {Socket} from "net";
import {SocketHandler, SocketMessage} from "../core/socket-handler";
import {Server} from "net";
import {Global} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";
import {BstStatistics, BstCommand, BstEvent} from "../statistics/bst-statistics";
const Logger = "NODEMGR";

export interface OnConnectCallback {
    (node: Node): void;
}

// The node manager handles the TCP tunnels from the clients
// The node manager can (and typically does) listen on ports 5000 and 80
export class NodeManager {
    public host: string = "0.0.0.0";
    public nodes: {[id: string]: Node } = {};
    private servers: NodeServer[];
    public onConnect: OnConnectCallback = null;
    public onNodeRemoved: (node: Node) => void = null; // Added for testability

    constructor(private ports: number[]) {}

    public node (nodeID: string): Node {
        return this.nodes[nodeID];
    }

    public async start (): Promise<void> {
        this.servers = [];
        // Create listeners on as many ports as specified
        for (const port of this.ports) {
            const server = new NodeServer(this, port);
            await server.start();
            this.servers.push(server);
        }
    }

    public static onKeepAliveReceived(node: Node): void {
        // Reply with the same message on a Keep Alive
        node.socketHandler.send(new SocketMessage(Global.KeepAliveMessage));
    }

    /**
     * Calling stop tells the server to stop listening
     * However, connections are not closed until all sockets disconnect, so loop through sockets and force a disconnect
     * @param callback
     */
    public async stop (): Promise<void> {
        for (let key of Object.keys(this.nodes)) {
            const node: Node = this.node(key);
            node.socketHandler.disconnect();
            LoggingHelper.info(Logger, "NODE CLOSING: " + node.id);
        }

        for (const server of this.servers) {
            await server.stop();
        }
    }
}

// Sets up a listener for handling tunnels on the specified port
class NodeServer {
    private server: Server;
    public constructor(private nodeManager: NodeManager, private port: number) {}

    public start(): Promise<void> {
        this.server = net.createServer((socket: Socket) => {
            let initialConnection = true;
            let node: Node = null;
            const socketHandler = new SocketHandler(socket, (socketMessage: SocketMessage) => {
                // We do special handling when we first connect
                const strMessage: string = socketMessage.asString();

                if (initialConnection) {
                     if (!socketMessage.isJSON()) {
                        // We just drop it the payload is not correct
                        LoggingHelper.error(Logger, "Error on parsing initial message: " + strMessage);
                        socketHandler.disconnect();
                        return;
                    }

                    const connectData = socketMessage.asJSON();

                    node = new Node(connectData.id, socketHandler);
                    this.nodeManager.nodes[node.id] = node;

                    socketHandler.send(new SocketMessage("ACK"));
                    initialConnection = false;

                    if (this.nodeManager.onConnect != null) {
                        this.nodeManager.onConnect(node);
                    }

                    // Capture the connection
                    BstStatistics.instance().record(BstCommand.proxy, BstEvent.connect, node.id);
                } else if (strMessage === Global.KeepAliveMessage) {
                    NodeManager.onKeepAliveReceived(node);

                } else if (node.handlingRequest()) {
                    // Handle the case where the data received is a reply from the node to data sent to it
                    node.onReply(socketMessage);
                }
            });

            // When the socket closes, remove it from the dictionary
            socketHandler.onCloseCallback = () => {
                if (node !== null) {
                    LoggingHelper.info(Logger, "NODE CLOSED: " + node.id);
                    delete this.nodeManager.nodes[node.id];
                    if (this.nodeManager.onNodeRemoved !== undefined && this.nodeManager.onNodeRemoved !== null) {
                        this.nodeManager.onNodeRemoved(node);
                    }
                }
            };

            // We have a connection - a socket object is assigned to the connection automatically
            LoggingHelper.info(Logger, "NODE CONNECTED: " + socket.remoteAddress + ":" + socket.remotePort);

        }).listen(this.port, this.nodeManager.host);

        // Make a callback when the server starts up
        return new Promise((resolve) => {
            this.server.on("listening", () => {
                LoggingHelper.info(Logger, "NodeMgr Listening on " + this.nodeManager.host + ":" + this.port);
                resolve();
            });
        });
    }

    stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close(function (error: any) {
                if (error !== undefined) {
                    LoggingHelper.error(Logger, "ERROR! NodeManager not stopped: " + error);
                    reject(error);
                } else {
                    LoggingHelper.info(Logger, "STOPPED");
                    resolve();
                }
            });
        });
    }
}