/**
 * Created by jpk on 7/1/16.
 */
import * as net from 'net';
import {Connection} from "./connection";
import {Socket} from "net";

export interface OnReceiveCallback {
    (connection: Connection, data: string): void;
}

export interface OnCloseCallback {
    (connection: Connection): void;
}

export class ConnectionHandler {
    public host:string = '0.0.0.0';
    public onReceiveCallback:OnReceiveCallback;
    public onCloseCallback:OnCloseCallback;

    private connections: {[id: string] : Connection } = {};

    constructor(private port:number,
                private onConnect:(connection: Connection) => void) {}

    public start () {
        console.log("Test!");
        let self = this;
        net.createServer(function(socket:Socket) {
            let connection = new Connection(self, socket);
            self.connections[connection.uuid] = connection;

            self.onConnect(connection);

            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);

        }).listen(this.port, this.host);

        console.log('Server listening on ' + this.host +':'+ this.port);
    }
}