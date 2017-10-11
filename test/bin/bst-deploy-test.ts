import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {SinonSandbox} from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
const dotenv = require("dotenv");

// The test project
const deployProject: string = "./deployProject";

// Test lambda name
const testLambdaName: string = "test-lambda-name";

// Sets up environment variables from .env file
dotenv.config();

let LambdaConfig;
describe("bst-deploy", function() {
    let lambdaConfig = null;
    let skip: boolean = false;
    let globalModule = {
        Global: {
            initializeCLI: async function () {
            },
            config: function () {
                return {
                    configuration: {
                        lambdaDeploy: {},
                    },
                    save: function () {

                    },
                };
            },
            running : function() {
                let p = new BSTProcess();
                p.port = 9999;
                return p;
            },

            version: function () {
                return "0.0.0";
            },
        }
    };

    before(async function (): Promise<void> {
        this.timeout(20000);
        try {
            mockery.enable({useCleanCache: true});
            mockery.warnOnUnregistered(false);
            mockery.warnOnReplace(false);
            mockery.registerMock("../core/global", globalModule);
            mockery.registerMock("../lib/core/global", globalModule);

            LambdaConfig = require("../../lib/client/lambda-config").LambdaConfig;

            lambdaConfig = LambdaConfig.create();
            lambdaConfig.initialize();

            if (!lambdaConfig.AWS_ACCESS_KEY_ID) {
                console.log("Skipping deployer tests. No AWS credentials.");
                skip = true;
            }
        }  catch (error) {
            console.log("Error: ", error);
            throw error;
        }

    });

    let sandbox: SinonSandbox = null;

    let mockDeployModule: any = {
        LambdaDeploy: {
            lambdaConfig: LambdaConfig,

            create: function (lambdaFolder: string, lambdaConfig: any) {
                assert.equal(lambdaFolder, deployProject);
                this.lambdaConfig = lambdaConfig;
                return this;
            }
        }
    };

    let mockRoleModule: any = {
        LambdaRole: {
            create: function () {
                return this;
            },
            getRole: function (roleName: string) {
                return new Promise((resolve, reject) => {
                    resolve("dummy-arn");
                });
            }
        }
    };

    let mockDeploy: any = mockDeployModule.LambdaDeploy;

    beforeEach(function () {
        if (skip) this.skip();
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/client/lambda-deploy", mockDeployModule);
        mockery.registerMock("../lib/client/lambda-role", mockRoleModule);
        mockery.registerMock("../core/global", globalModule);
        mockery.registerMock("../lib/core/global", globalModule);
        mockery.registerMock("../lib/core/logging-helper", {
            LoggingHelper: {
                setVerbose: () => {}
            }
        });

        sandbox = sinon.sandbox.create();
        sandbox.stub(process, "exit", function () {}); // Ignore exit()
        process.chdir("test/resources");
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
        process.chdir("../..");
    });

    describe("Help command", function() {
        let originalFunction: any = null;
        beforeEach (function () {
            originalFunction = process.stdout.write;
        });

        afterEach (function () {
        });

        it("Prints help with no-args", function(done) {
            this.timeout(2000);

            process.argv = command("node bst-deploy.js");
            let dataString: string = "";

            (<any> process.stdout).write = function (buffer: Buffer|string) {
                if (buffer instanceof Buffer) {
                    dataString = dataString + buffer.toString();
                } else {
                    dataString = dataString + buffer;
                }
            };

            // Wait for all - maybe more than one message
            setTimeout(() => {
                process.stdout.write = originalFunction;

                if (dataString.indexOf("Usage") !== -1) {
                    done();
                } else {
                    done(new Error("Usage was not in the output!"));
                }
            }, 1000);

            NodeUtil.load("../../bin/bst-deploy.js");
        });
    });

    describe("Lambda command", function() {
        it("No options", function(done) {
            this.timeout(5000);

            process.argv = command("node bst-deploy.js lambda " + deployProject);

            mockDeploy.deploy = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-deploy.js");
        });

        it("Options", function(done) {
            this.timeout(5000);
            process.argv = command("node bst-deploy.js lambda " + deployProject + " --verbose --lambdaName " + testLambdaName);
            let verboseCalled = false;

            sandbox.stub(console, "log", function (log: string) {
                if (log.indexOf("Enabling verbose logging") !== -1) {
                    verboseCalled = true;

                }
            });

            let optionsSet = false;

            mockDeploy.deploy = function () {
                sandbox.restore();

                optionsSet = mockDeploy.lambdaConfig.AWS_FUNCTION_NAME === testLambdaName;

                if (!verboseCalled) {
                    done(new Error("Verbose must be set"));
                } else if (!optionsSet) {
                    done(new Error("Options not set"));
                } else {
                    done();
                }
            };

            NodeUtil.load("../../bin/bst-deploy.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};