/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {Connection} from "../../service/connection";
import {ConnectionHandler} from '../../service/connection-handler';

describe('ConnectionHandler', function() {
    describe('Connect', function() {
        it('Should Connect and Receive Data', function(done) {
            let handler = new ConnectionHandler(9999,
                function (connection: Connection) {
                    assert.equal("127.0.0.1", connection.remoteAddress());
                });
            handler.onReceiveCallback = function(connection, data) {
                assert.equal("127.0.0.1", connection.remoteAddress());
                assert.equal("I am Chuck Norris!", data);
                done();
            };

            handler.start();

            let client = new BespokeClient("localhost", 9999);
            client.connect();
            client.write("I am Chuck Norris!");
            //assert.ok(true);
        });
    });
});