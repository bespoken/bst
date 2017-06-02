/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import {NodeUtil} from "../../lib/core/node-util";

describe("Global", function() {
    let Global: any = null;
    beforeEach(function () {
        Global = NodeUtil.requireClean("../../lib/core/global").Global;
    });

    describe("#initialize", function() {
        it("Starts as CLI", async function() {
            await Global.initializeCLI();
            assert(Global.cli());
        });

        it("Have Config once Initialized", async function() {
            await Global.initializeCLI();
            assert(Global.config());
        });

        it("Have offline config once Initialized", function () {
            Global.initialize(false, true);
            assert.deepEqual(Global.config().configuration, {
                sourceID: "0000000-0000-0000-0000-000000000000",
                secretKey: "offline-mode",
                lambdaDeploy: {
                    runtime: "nodejs4.3",
                    role: "lambda-bst-execution",
                    handler: "index.handler",
                    description: "My BST lambda skill",
                    timeout: 3,
                    memorySize: 128,
                    vpcSubnets: "",
                    vpcSecurityGroups: "",
                    excludeGlobs: "event.json"
                }
            });
        });

        it("Checks Running", function(done) {
            assert(Global.running() !== undefined);
            done();
        });
    });
});