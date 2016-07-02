/// <reference path="../typings/modules/node-uuid/index.d.ts" />

import * as uuid from 'node-uuid';
import {Socket} from "net";
import {NodeManager} from "./node-manager";
import {Global} from "./global";
import {SocketHandler} from "./socket-handler";

export class Node {
    constructor(public id: string, public remoteAddress: string) {}

}