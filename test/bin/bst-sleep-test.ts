import * as sinon from "sinon";
import {SinonSandbox} from "sinon";
import {NodeUtil} from "../../lib/core/node-util";

describe("bst-sleep", function() {
    let sandbox: SinonSandbox = null;
    beforeEach(function () {
        // Picks up lint on re-runs - dump it every time
        delete require.cache[require.resolve("commander")];
        sandbox = sinon.sandbox.create();
        sandbox.stub(process, "exit", function () {}); // Ignore exit()
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("sleep command", function() {
        it("sleep with no-args", function (done) {
            process.argv = command("node bst-sleep.js");
            // Stub process.stdout because this is what Commander uses (had to look at the code to figure this out)
            sandbox.stub(process.stdout, "write", function (data?: string) {
                if (data !== undefined && data.indexOf("Instructs") !== -1) {
                    done();
                }
            });

            NodeUtil.run("../../bin/bst-sleep.js");
        });

        it("sleep with non-brooklyn", function (done) {
            process.argv = command("node bst-sleep.js NotBrooklyn");

            // Had better luck using strap up Sinon stubs as opposed to the sandbox
            //  Sandbox does not seem to restore correctly and suites with multiple tests act weird
            //  In particular, they call "done" multiple times
            sandbox.stub(console, "log", function (data?: string) {
                if (data !== undefined && data.indexOf("Did you know") !== -1) {
                    done();
                }
            });

            NodeUtil.run("../../bin/bst-sleep.js");
        });

        it("sleep with brooklyn", function (done) {
            process.argv = command("node bst-sleep.js brooklyn");

            // Had better luck using strap up Sinon stubs as opposed to the sandbox
            //  Sandbox does not seem to restore correctly and suites with multiple tests act weird
            //  In particular, they call "done" multiple times
            sandbox.stub(console, "log", function (data?: string) {
                if (data !== undefined && data.indexOf("Yeah") !== -1) {
                    done();
                }
            });

            NodeUtil.run("../../bin/bst-sleep.js");
        });
    });
});

let command = function (c: string): Array<string> {
    return c.split(" ");
};