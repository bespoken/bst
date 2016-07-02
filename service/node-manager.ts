/**
 * Created by jpk on 7/1/16.
 */
import * as net from 'net';
import {Node} from "./node";
import {Socket} from "net";
import {SocketHandler} from "./socket-handler";

export interface OnConnectCallback {
    (node: Node): void;
}

export interface OnReceiveCallback {
    (connection: Node, data: string): void;
}

export interface OnCloseCallback {
    (connection: Node): void;
}

export class NodeManager {
    public host:string = '0.0.0.0';
    public onClose:OnCloseCallback;
    public onConnect:OnConnectCallback;
    public onReceive:OnReceiveCallback;


    private sockets: {[id: string] : SocketHandler } = {};

    constructor(private port:number) {}

    public start () {

        let self = this;
        net.createServer(function(socket:Socket) {
            let socketHandler = new SocketHandler(socket, function(message: string) {
                let connectData = JSON.parse(message);
                let node = new Node(connectData.id, socket.remoteAddress);
                self.sockets[node.id] = socketHandler;
                socketHandler.send("ACK", null);
                self.onConnect(node);
            });

            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        }).listen(this.port, this.host);

        console.log('Server listening on ' + this.host + ':' + this.port);
    }
}