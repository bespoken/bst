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

        it("Lazy Loads Config", function(done) {
            assert(Global.config());
            done();
        });

        it("Checks Running", function(done) {
            assert(Global.running() !== undefined);
            done();
        });
    });
});