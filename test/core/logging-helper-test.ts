import * as assert from "assert";
import * as sinon from "sinon";
import * as winston from "winston";

import {LoggingHelper} from "../../lib/core/logging-helper";
import {SinonSandbox} from "sinon";

describe("LoggingHelper", function() {
    let sandbox: SinonSandbox = null;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("#initialize", function() {
        it("Logs correctly", function(done) {
            LoggingHelper.initialize(true);
            winston.error("Test", function () {
                done();
            });
        });

        it("Toggles verbosity", function(done) {
            LoggingHelper.initialize(true);
            let logger = function (log: string) {
                assert(log.indexOf("Verbosity1") === -1);
                assert(log.indexOf("Verbosity3") === -1);

                if (log.indexOf("Verbosity2") !== -1) {
                    LoggingHelper.setVerbose(false);
                    winston.log("verbose", "Verbosity3");
                    winston.info("Verbosity4");
                }

                if (log.indexOf("Verbosity4") !== -1) {
                    done();
                }
            };

            // Stub stderr and stdout - seems winston sends to both
            // Though seemingly debug goes to stderr and info goes to stdout!
            sandbox.stub(process.stderr, "write", logger);
            sandbox.stub(process.stdout, "write", logger);

            winston.debug("Verbosity1", function () {
                LoggingHelper.setVerbose(true);
                winston.log("verbose", "Verbosity2");
            });
        });
    });
});