import * as assert from "assert";
import {NodeUtil} from "../../lib/core/node-util";
import * as mockery from "mockery";

const mockConfig = {
    BSTConfig: {
        load: () => {
            return Promise.resolve({
                secretKey: () => "SECRET_KEY",
            });
        },
    },
    BSTProcess: {
        running: () => true,
    }
};

describe("Global", function() {
    let Global: any = null;
    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("../client/bst-config", mockConfig);
        Global = NodeUtil.requireClean("../../lib/core/global").Global;
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
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

        it("Checks Running", function(done) {
            assert(Global.running() !== undefined);
            done();
        });
    });
});