/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
"use strict";
var assert = require("assert");
var bespoke_client_1 = require('../../client/bespoke-client');
var node_manager_1 = require('../../service/node-manager');
describe('NodeManager', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var handler = new node_manager_1.NodeManager(9999);
            var client = new bespoke_client_1.BespokeClient("localhost", 9999);
            handler.onConnect = function (connection) {
                assert.equal("127.0.0.1", connection.remoteAddress());
            };
            handler.onReceive = function (connection, data) {
                console.log("OnReceive: " + data);
                assert.equal("127.0.0.1", connection.remoteAddress());
                assert.equal("I am Chuck Norris!", data);
                client.disconnect();
            };
            handler.onClose = function () {
                done();
            };
            handler.start();
            client.connect();
            client.write("I am Chuck Norris!", null);
            //client.disconnect();
            //assert.ok(true);
        });
    });
});
