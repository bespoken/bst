/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import ConnectionHandler from '../../service/connection-handler';
import BespokeClient from '../../client/bespoke-client';
import * as assert from "assert";

describe('ConnectionHandler', function() {
    describe('Connect', function() {
        it('Should Connect and Receive Data', function(done) {
            let handler = new ConnectionHandler(9999,
                function (remoteAddress:string) {
                    assert.equal("127.0.0.1", remoteAddress);
                },
                function (data: string) {
                    assert.equal("I am Chuck Norris!", data);
                    done();
                });
            handler.start();

            let client = new BespokeClient("localhost", 9999);
            client.connect();
            //assert.ok(true);
        });
    });
});