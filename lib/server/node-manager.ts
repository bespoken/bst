import * as net from "net";
import {Node} from "./node";
import {Socket} from "net";
import {SocketHandler, SocketMessage} from "../core/socket-handler";
import {Server} from "net";
import {Global} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";
import {Statistics, AccessType} from "./statistics";

const Logger = "NODEMGR";

export interface OnConnectCallback {
    (node: Node): void;
}

export class NodeManager {
    public host: string = "0.0.0.0";
    public onConnect: OnConnectCallback = null;
    public onNodeRemoved: (node: Node) => void = null; // Added for testability

    private nodes: {[id: string]: Node } = {};
    private server: Server;

    constructor(private port: number) {}

    public node (nodeID: string): Node {
        return this.nodes[nodeID];
    }

    public start (callback?: () => void) {
        const self = this;
        this.server = net.createServer(function(socket: Socket) {
            let initialConnection = true;
            let node: Node = null;
            const socketHandler = new SocketHandler(socket, function(socketMessage: SocketMessage) {
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
                    self.nodes[node.id] = node;

                    socketHandler.send(new SocketMessage("ACK"));
                    initialConnection = false;

                    if (self.onConnect != null) {
                        self.onConnect(node);
                    }

                    // Capture the connection
                    Statistics.instance().record(node.id, AccessType.CONNECT);
                } else if (strMessage === Global.KeepAliveMessage) {
                    NodeManager.onKeepAliveReceived(node);

                } else if (node.handlingRequest()) {
                    // Handle the case where the data received is a reply from the node to data sent to it
                    node.onReply(socketMessage);
                }
            });

            // When the socket closes, remove it from the dictionary
            socketHandler.onCloseCallback = function() {
                if (node !== null) {
                    LoggingHelper.info(Logger, "NODE CLOSED: " + node.id);
                    delete self.nodes[node.id];
                    if (self.onNodeRemoved !== undefined && self.onNodeRemoved !== null) {
                        self.onNodeRemoved(node);
                    }
                }
            };

            // We have a connection - a socket object is assigned to the connection automatically
            LoggingHelper.info(Logger, "NODE CONNECTED: " + socket.remoteAddress + ":" + socket.remotePort);

        }).listen(this.port, this.host);

        // Make a callback when the server starts up
        this.server.on("listening", function () {
            // On startup, call callback if defined
            if (callback !== undefined && callback !== null) {
                callback();
            }
        });

        LoggingHelper.info(Logger, "Listening on " + this.host + ":" + this.port);
    }

    private static onKeepAliveReceived(node: Node): void {
        // Reply with the same message on a Keep Alive
        node.socketHandler.send(new SocketMessage(Global.KeepAliveMessage));
    }

    /**
     * Calling stop tells the server to stop listening
     * However, connections are not closed until all sockets disconnect, so loop through sockets and force a disconnect
     * @param callback
     */
    public stop (callback: () => void): void {
        for (let key of Object.keys(this.nodes)) {
            const node: Node = this.node(key);
            node.socketHandler.disconnect();
            LoggingHelper.info(Logger, "NODE CLOSING: " + node.id);
        }

        this.server.close(function (error: any) {
            if (error !== undefined) {
                LoggingHelper.error(Logger, "ERROR! NodeManager not stopped: " + error);
            } else {
                LoggingHelper.info(Logger, "STOPPED");
                callback();
            }
        });
    }
}