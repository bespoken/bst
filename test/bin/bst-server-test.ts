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
            process.argv = command("node bst-server.js start 4000 5000");
            mockery.registerMock("../lib/server/bespoke-server", {
                BespokeServer: function (port: number, port2: number) {
                    assert.equal(port, 4000);
                    assert.equal(port2, 5000);

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