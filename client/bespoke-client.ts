/**
 * Created by jpk on 7/1/16.
 */
import * as net from 'net';

export default class BespokeClient {
    constructor(private host:string, private port:number) {}

    public connect():void {
        var client = new net.Socket();
        let self = this;
        client.connect(this.port, this.host, function() {
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write('I am Chuck Norris!');
        });
    }
}