/**
 * Created by jpk on 7/1/16.
 */
import * as net from 'net';

export default class ConnectionHandler {
    private host:string = '0.0.0.0';
    constructor(private port:number,
                private onConnect:(remoteAddress: string) => void,
                private onReceive:(data: string) => void) {}

    public start () {
        console.log("Test!");
        let self = this;
        net.createServer(function(socket) {
            self.onConnect(socket.remoteAddress);

            // We have a connection - a socket object is assigned to the connection automatically
            console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);

            // Add a 'data' event handler to this instance of socket
            socket.on('data', function(data) {

                console.log('DATA ' + socket.remoteAddress + ': ' + data);
                // Write the data back to the socket, the client will receive it as data from the server
                socket.write('You said "' + data + '"');

                self.onReceive(data);
            });

            // Add a 'close' event handler to this instance of socket
            socket.on('close', function(data) {
                console.log('CLOSED: ' + socket.remoteAddress +' '+ socket.remotePort);
            });

        }).listen(this.port, this.host);

        console.log('Server listening on ' + this.host +':'+ this.port);
    }
}