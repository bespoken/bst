/**
 * Created by jpk on 7/1/16.
 */
import * as net from 'net';
import {NodeConnection} from "./node-connection";
import {Socket} from "net";

export interface OnConnectCallback {
    (connection: NodeConnection): void;
}

export interface OnReceiveCallback {
    (connection: NodeConnection, data: string): void;
}

export interface OnCloseCallback {
    (connection: NodeConnection): void;
}

export class NodeManager {
    public host:string = '0.0.0.0';
    public onClose:OnCloseCallback;
    public onConnect:OnConnectCallback;
    public onReceive:OnReceiveCallback;


    private nodes: {[id: string] : NodeConnection } = {};

    constructor(private port:number) {}

    public start () {

        let self = this;
        net.createServer(function(socket:Socket) {
            let node = new NodeConnection(self, socket);
            self.nodes[node.uuid] = node;

            self.onConnect(node);

            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);

        }).listen(this.port, this.host);

        console.log('Server listening on ' + this.host +':'+ this.port);
    }
}