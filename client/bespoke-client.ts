/// <reference path="../typings/modules/es6-promise/index.d.ts" />

import * as net from 'net';
import {Socket} from 'net';
import {Promise} from 'es6-promise';

export class BespokeClient {
    private client:Socket;
    private initialized:Promise<boolean>;

    constructor(private host:string, private port:number) {}

    public connect():void {
        this.client = new net.Socket();
        let self = this;


        this.initialized = new Promise<boolean>((resolve, reject) => {
            self.client.connect(this.port, this.host, function() {
                // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
                resolve(true);
            });
        });

    }

    public write(data: string):void {
        let self = this;
        this.initialized.then(function () {
            console.log("Test");
            self.client.write(data);
        });
    }

    public disconnect() {
        this.client.end();
        //this.client.destroy();
    }
}