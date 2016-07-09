"use strict";
const bespoke_client_1 = require('../../client/bespoke-client');
const http_client_1 = require("../../client/http-client");
const bespoke_server_1 = require("../../service/bespoke-server");
describe('BespokeServerTest', function () {
    describe('Receive Webhook Failure', function () {
        it('Connects And Then Fails', function (done) {
            let server = new bespoke_server_1.BespokeServer(8000, 9000);
            server.start();
            let bespokeClient = new bespoke_client_1.BespokeClient("JPK", "localhost", 9000, 9001);
            bespokeClient.connect();
            let webhookCaller = new http_client_1.HTTPClient();
            webhookCaller.post("localhost", 8000, "/test?node-id=JPK", "Test");
            setTimeout(function () {
                done();
            }, 1500);
        });
    });
});
//# sourceMappingURL=bespoke-server-test.js.map