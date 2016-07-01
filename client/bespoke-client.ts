/// <reference path="../typings/modules/es6-promise/index.d.ts" />

import * as net from 'net';
import {Socket} from 'net';
import {Promise} from 'es6-promise';

export class BespokeClient {
    private client: Socket;
    private connected: Promise<void> = null;

    constructor(private host:string, private port:number) {}

    public connect():void {
        this.client = new net.Socket();
        let self = this;

        //Use a connected promise to wait on any other stuff that needs to happen
        this.connected = new Promise<void>((resolve) => {
            self.client.connect(this.port, this.host, function() {
                resolve();
            });
        });

    }

    public write(data: string, callback: () => void):void {
        if (this.connected == null) {
            return;
        }

        let self = this;
        this.connected.then(function () {
            self.client.write(data, callback);
        });
    }

    public disconnect():void {
        let self = this;
        this.connected.then(function () {
            self.client.end();
        });
    }
}