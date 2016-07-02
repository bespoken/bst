/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import * as assert from "assert";

import {BespokeClient} from '../../client/bespoke-client';
import {Node} from "../../service/node";
import {NodeManager} from '../../service/node-manager';
import {WebhookManager} from "../../service/webhook-manager";
import {WebhookRequest} from "../../service/webhook-request";
import {HTTPClient} from "../../client/http-client";
import {BespokeServer} from "../../service/bespoke-server";

describe('BespokeServerTest', function() {
    describe('ReceiveWebhook', function() {
        it('Should Connect and Receive Data', function(done) {
            ////Start the server
            //let server = new BespokeServer(8000, 9000);
            //server.start();
            //
            ////Connect a client
            //let bespokeClient = new BespokeClient("JPK", "localhost", 9000);
            //bespokeClient.connect();
            //
            //let webhookCaller = new HTTPClient();
            //client.post(localhost, 8000, "Test");
            //done();
        });
    });
});