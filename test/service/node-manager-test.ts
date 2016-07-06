/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {Node} from "../../service/node";
import {NodeManager} from '../../service/node-manager';

describe('NodeManager', function() {
    describe('Connect', function() {
        it('Should Connect and Receive Data', function(done) {
            let nodeManager = new NodeManager(9999);
            let client = new BespokeClient("JPK", "localhost", 9999);

            nodeManager.onConnect = function (node: Node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                done();
            };

            let count = 0;
            nodeManager.onReceive = function(node, data) {
                console.log("OnReceive: " + data);
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());

                count++;
                if (count == 1) {
                    assert.equal("{\"id\":\"JPK\"}", data);
                    client.disconnect();
                } else {
                    assert.equal("I am Chuck Norris!", data);

                }

            };

            nodeManager.onClose = function() {

            };

            nodeManager.start();
            client.connect();
            setTimeout(function () { console.log("Time UP") }, 2000);
            //client.send("I am Chuck Norris!");
            //client.disconnect();
            //assert.ok(true);
        });


    });
});