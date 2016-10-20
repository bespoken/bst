/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as mockery from "mockery";
import * as sinon from "sinon";
import {NodeUtil} from "../../lib/core/node-util";
import SinonSandbox = Sinon.SinonSandbox;
import {LambdaConfig} from "../../lib/client/lambda-config";

// The test project
const deployProject: string = "./deployProject";

// Test lambda name
const testLambdaName: string = "test-lamda-name";

describe("bst-deploy", function() {
    let sandbox: SinonSandbox = null;

    let mockDeployModule: any = {
        LambdaDeploy: {
            lambdaConfig: LambdaConfig,

            create: function (lambdaFolder: string, lambdaConfig: LambdaConfig) {
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
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/client/lambda-deploy", mockDeployModule);
        mockery.registerMock("../lib/client/lambda-role", mockRoleModule);
        sandbox = sinon.sandbox.create();
        process.chdir("test/resources");
    });

    afterEach(function () {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
        process.chdir("../..");
    });

    describe("help command", function() {
        it("with no-args", function(done) {
            let originalFunction = process.stdout.write;

            process.argv = command("node bst-deploy.js");

            (<any> process.stdout).write = function (data: Buffer) {
                let dataString: string = data.toString();

                process.stdout.write = originalFunction; // you have to restore it here

                if (dataString.indexOf("usage") !== -1) {
                    done();
                } else {
                    done(new Error("Usage wasn't in the output"));
                }
            };

            NodeUtil.load("../../bin/bst-deploy.js");
        });
    });

    describe("lambda command", function() {
        it("with no options", function(done) {
            this.timeout(5000);

            process.argv = command("node bst-deploy.js lambda " + deployProject);

            mockDeploy.deploy = function () {
                done();
            };

            NodeUtil.load("../../bin/bst-deploy.js");
        });

        it("with options", function(done) {
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