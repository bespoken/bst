/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {Node} from "../../service/node";
import {NodeManager} from '../../service/node-manager';

describe('NodeManager', function() {
    describe('Connect', function() {
        it('Connected And Received Data', function(done) {
            let nodeManager = new NodeManager(9000);
            let client = new BespokeClient("JPK", "localhost", 9000, 9001);

            nodeManager.onConnect = function (node: Node) {
                assert.equal("127.0.0.1", node.socketHandler.remoteAddress());
                nodeManager.stop(function() {
                    done();
                });
            };

            nodeManager.start();
            client.connect();
            setTimeout(function () { console.log("Time UP") }, 2000);
        });
    });

    describe('Close', function() {
        it('Worked', function (done) {
            let nodeManager = new NodeManager(9000);

            nodeManager.start();
            //
            setTimeout(function() {
                nodeManager.stop(function () {
                    done();
                });
            }, 100);
        });
    });
});