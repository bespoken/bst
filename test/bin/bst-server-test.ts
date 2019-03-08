import * as assert from "assert";
import * as mockery from "mockery";
import {NodeUtil} from "../../lib/core/node-util";

describe("bst-server", function() {

    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
    });

    afterEach(function () {
        mockery.disable();
    });

    describe("start command", function() {
        it("Starts", function(done) {
            process.argv = command("node bst-server.js start 4000 5000 80");
            mockery.registerMock("../lib/server/bespoke-server", {
                BespokeServer: function (port: number, ports: number[]) {
                    assert.equal(port, 4000);
                    assert.equal(ports[0], 5000);
                    assert.equal(ports[1], 80);

                    this.start = function () {
                        done();
                    };
                    return this;
                }
            });

            NodeUtil.load("../../bin/bst-server.js");
        });

    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};