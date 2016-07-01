/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
"use strict";
var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var connection_handler_1 = require('../../service/connection-handler');
describe('ConnectionHandler', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var handler = new connection_handler_1.ConnectionHandler(9999);
            handler.onConnect = function (connection) {
                assert.equal("127.0.0.1", connection.remoteAddress());
            };
            handler.onReceive = function (connection, data) {
                assert.equal("127.0.0.1", connection.remoteAddress());
                assert.equal("I am Chuck Norris!", data);
                done();
            };
            handler.onClose = function () {
                done();
            };
            handler.start();
            var client = new bespoke_client_1.BespokeClient("localhost", 9999);
            client.connect();
            client.write("I am Chuck Norris!");
            client.disconnect();
            //assert.ok(true);
        });
    });
});
