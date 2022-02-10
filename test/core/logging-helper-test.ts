import * as assert from "assert";
import * as sinon from "sinon";
import * as winston from "winston";

import {LoggingHelper} from "../../lib/core/logging-helper";
import {SinonSandbox} from "sinon";

// TODO fix test
xdescribe("LoggingHelper", function() {
    let sandbox: SinonSandbox = null;
    before(function() {
        LoggingHelper.initialize(true);

    });

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("#initialize", function() {
        it("Logs correctly", function(done) {
            LoggingHelper.error("Test", "message", function () {
                done();
            });
        });

        it("Toggles verbosity", function(done) {
            let logger = function (log: string): boolean {
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
                return true;
            };

            // Stub stderr and stdout - seems winston sends to both
            // Though seemingly debug goes to stderr and info goes to stdout!
            sandbox.stub(process.stderr, "write").callsFake(logger);
            sandbox.stub(process.stdout, "write").callsFake(logger);

            winston.debug("Verbosity1", function () {
                LoggingHelper.setVerbose(true);
                winston.log("verbose", "Verbosity2");
            });
        });
    });
});