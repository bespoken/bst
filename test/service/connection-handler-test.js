/**
 * Created by jpk on 7/1/16.
 */
/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
"use strict";
var connection_handler_1 = require('../../service/connection-handler');
var bespoke_client_1 = require('../../client/bespoke-client');
var assert = require("assert");
describe('ConnectionHandler', function () {
    describe('Connect', function () {
        it('Should Connect and Receive Data', function (done) {
            var handler = new connection_handler_1["default"](9999, function (remoteAddress) {
                assert.equal("127.0.0.1", remoteAddress);
            }, function (data) {
                assert.equal("I am Chuck Norris!", data);
                done();
            });
            handler.start();
            var client = new bespoke_client_1["default"]("localhost", 9999);
            client.connect();
            //assert.ok(true);
        });
    });
});
