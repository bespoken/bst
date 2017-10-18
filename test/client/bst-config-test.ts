import * as assert from "assert";
import * as fs from "fs";
import * as sinon from "sinon";
import {SinonSandbox} from "sinon";
import {exec} from "child_process";
import {ProxyType} from "../../lib/client/bst-proxy";
import {BSTProcess} from "../../lib/client/bst-config";
import * as mockery from "mockery";

let globalModule = {
    Global: {
        initializeCLI: async function () {
        },
        config: function () {
            return {
                configuration: {
                    lambdaDeploy: {},
                },
                secretKey: function () {
                    return "secretKey";
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

// Getting uuid with require because we have issues with typings
const uuid =  require("uuid");
let BSTConfig;

describe("BSTConfig", function() {
    this.timeout(30000);

    before(function() {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.warnOnReplace(false);
        mockery.registerMock("../external/source-name-generator", {
            SourceNameGenerator: SourceNameGenerator,
        });
        mockery.registerMock("../external/spokes", {
            SpokesClient: SpokesClient,
        });

        BSTConfig = require("../../lib/client/bst-config").BSTConfig;
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe("#bootstrap()", function() {
        before(function () {
            (<any> BSTConfig).configDirectory = function () {
                return "test/resources/.bst";
            };
        });

        beforeEach(function (done) {
            exec("rm -rf " + (<any> BSTConfig).configDirectory(), function () {
                done();
            });
        });

        afterEach(function () {

        });

        it("Test new config created correctly", async function () {
            await (<any> BSTConfig).bootstrapIfNeeded();
            assert(fs.existsSync((<any> BSTConfig).configPath()));
        });

        it("Loads existing config", async function () {
            // Make sure we have a new one
            let config = await BSTConfig.load();
            let secretKey = config.secretKey();

            // Make sure it does not get created again
            let config2 = await BSTConfig.load();
            assert.equal(config2.secretKey(), secretKey);
            assert.equal(config2.secretKey(), "unit-test" + config2.sourceID());

        });

        it("Updates existing config", async function () {
            // Make sure we have a new one
            let config = await BSTConfig.load();
            let secretKey = config.secretKey();
            config.updateApplicationID("12345678");

            // Make sure it does not get created again
            let config2 = await BSTConfig.load();
            assert.equal(config2.secretKey(), secretKey);
            assert.equal(config2.applicationID(), "12345678");
        });

        it("Updates old config version (nodeID) when it doesn't have sourceID", async function () {
            // we load in order to create the file
            await BSTConfig.load();
            const nodeID = uuid.v4();
            const oldConfiguration = {
                nodeID,
                version: "1.0.0",
                lambdaDeploy: {
                    runtime: "nodejs4.3",
                    role: "",
                    handler: "index.handler",
                    description: "My BST lambda skill",
                    timeout: 3,
                    memorySize: 128,
                    vpcSubnets: "",
                    vpcSecurityGroups: "",
                    excludeGlobs: "event.json"
                }
            };

            // We overwrite the file
            let configBuffer = new Buffer(JSON.stringify(oldConfiguration, null, 4) + "\n");
            fs.writeFileSync("test/resources/.bst/config", configBuffer);

            let config = await BSTConfig.load();

            // assert we have the new keys
            assert.equal(config.secretKey(), nodeID);
            assert.notEqual(typeof config.sourceID(), "undefined");
        });

        it("Discard old sourceId when it doesn't have a version", async function () {
            // we load in order to create the file
            await BSTConfig.load();
            const oldConfiguration = {
                secretKey: "thisWillPersist",
                sourceID: "thisWillPersistToo",
                lambdaDeploy: {
                    runtime: "nodejs4.3",
                    role: "",
                    handler: "index.handler",
                    description: "My BST lambda skill",
                    timeout: 3,
                    memorySize: 128,
                    vpcSubnets: "",
                    vpcSecurityGroups: "",
                    excludeGlobs: "event.json"
                }
            };

            // We overwrite the file
            let configBuffer = new Buffer(JSON.stringify(oldConfiguration, null, 4) + "\n");
            fs.writeFileSync("test/resources/.bst/config", configBuffer);

            let config = await BSTConfig.load();

            // assert we have the new keys
            assert.equal(config.secretKey(), "thisWillPersist");
            assert.equal(config.sourceID(), "thisWillPersistToo");

        });

        it("Continue when sourceId return it exist error", async function () {
            // we load in order to create the file
            await BSTConfig.load();
            const oldConfiguration = {
                secretKey: "thisWillPersist",
                sourceID: "thisWillPersistToo",
                lambdaDeploy: {
                    runtime: "nodejs4.3",
                    role: "",
                    handler: "index.handler",
                    description: "My BST lambda skill",
                    timeout: 3,
                    memorySize: 128,
                    vpcSubnets: "",
                    vpcSecurityGroups: "",
                    excludeGlobs: "event.json"
                }
            };

            // We overwrite the file
            let configBuffer = new Buffer(JSON.stringify(oldConfiguration, null, 4) + "\n");
            fs.writeFileSync("test/resources/.bst/config", configBuffer);

            let config = await BSTConfig.load();

            // assert we have the new keys
            assert.equal(config.secretKey(), "thisWillPersist");
            assert.equal(config.sourceID(), "thisWillPersistToo");

        });
    });
});

describe("BSTProcess", function() {
    this.timeout(30000);

    describe("#run()", function() {
        let sandbox: SinonSandbox = null;

        before(function () {
            (<any> BSTProcess).processPath = function () {
                return "test/resources/.bst/process";
            };
        });

        beforeEach(function (done) {
            exec("rm -rf " + (<any> BSTConfig).configDirectory(), function () {
                sandbox = sinon.sandbox.create();
                done();
            });

        });

        afterEach(function () {
            sandbox.restore();
        });

        it("Test new process written", async function () {
            await BSTConfig.load();
            BSTProcess.run(9000, ProxyType.LAMBDA, 9999);

            let data = fs.readFileSync((<any> BSTProcess).processPath());
            let dataJSON = JSON.parse(data.toString());
            assert(dataJSON);
            assert.equal(dataJSON.pid, 9999);
        });

        it("Test existing process loaded", async function () {
            await BSTConfig.load();
            BSTProcess.run(9000, ProxyType.LAMBDA, 9999);

            // We stub is running because that is tricky to test
            sandbox.stub(BSTProcess, "isRunning", function (pid: string) {
                assert.equal(pid, 9999);
                return true;
            });

            let p = BSTProcess.running();
            assert.equal(p.pid, 9999);
        });

        it("Test existing process not running", async function () {
            await BSTConfig.load();
            BSTProcess.run(9000, ProxyType.LAMBDA, 9999);

            // We stub is running because that is tricky to test
            sandbox.stub(BSTProcess, "isRunning", function (pid: string) {
                assert.equal(pid, 9999);
                return false;
            });

            let p = BSTProcess.running();
            assert(p === null);
        });

        it("Tests REAL process is running", function (done) {
            let running = (<any> BSTProcess).isRunning(process.pid);
            assert(running);
            done();
        });

        it("Tests REAL process is not running", function (done) {
            // 100000 should be safe
            //  By convention, not greater than 32768
            //  http://unix.stackexchange.com/questions/16883/what-is-the-maximum-value-of-the-pid-of-a-process
            let running = (<any> BSTProcess).isRunning(100000);
            assert(!running);
            done();
        });

    });

    describe("#kill()", function() {
        let sandbox: SinonSandbox = null;
        let lambdaProcess: BSTProcess = null;

        before(function () {
            mockery.enable({useCleanCache: true});
            mockery.warnOnUnregistered(false);
            mockery.warnOnReplace(false);
            mockery.registerMock("../external/source-name-generator", {
                SourceNameGenerator: SourceNameGenerator,
            });
            mockery.registerMock("../external/spokes", {
                SpokesClient: SpokesClient,
            });
            mockery.registerMock("../core/global", globalModule);

            BSTConfig = require("../../lib/client/bst-config").BSTConfig;
            (<any> BSTConfig).configDirectory = function () {
                return "test/resources/.bst";
            };

            (<any> BSTProcess).processPath = function () {
                return "test/resources/.bst/process";
            };

            mockery.registerMock("./bst-config", { BSTProcess: <any> BSTProcess});


        });

        beforeEach(async function () {
            return new Promise(resolve => {
                exec("rm -rf " + (<any> BSTConfig).configDirectory(), async function () {
                    sandbox = sinon.sandbox.create();
                    fs.mkdirSync((<any> BSTConfig).configDirectory());
                    resolve();
                });
            });
        });

        afterEach(function () {
            sandbox.restore();
        });

        after(function (done) {
            exec("rm -rf " + (<any> BSTConfig).configDirectory(), function () {
                mockery.deregisterAll();
                mockery.disable();
                done();
            });
        });

        it("Test new process written", function (done) {
            let runningPid: number = null;
            const BSTProxy = require("../../lib/client/bst-proxy").BSTProxy;
            let proxy = new BSTProxy(ProxyType.LAMBDA).port(10000);

            sandbox.stub(process, "kill", function (pid: number, code: any) {
                // Have to make sure to do the right thing when code is 0
                //  Otherwise, the initial check on whether the process is running does not work correctly
                //  FYI, calling kill with code 0 is what checks if a process is running
                if (code === 0) {
                    return true;
                }
                assert.equal(pid, runningPid);
                assert.equal(code, "SIGKILL");
                proxy.stop(function () {
                    done();
                });
            });

            proxy.start(function () {
                lambdaProcess = BSTProcess.running();
                runningPid = lambdaProcess.pid;
                lambdaProcess.kill();
            });
        });
    });
});

class SourceNameGenerator {
    public callService() {
        const id = uuid.v4();
        return {
            id,
                secretKey: "unit-test" + id,
            };
    };

    public createDashboardSource () {};
}

class SpokesClient {
    public constructor(private _id: string, private _secretKey: string) {
    }

    public verifyUUIDisNew() {
        return true;
    }

    public createPipe () {
        return {
            uuid: this._secretKey,
            diagnosticsKey: null,
            endPoint: {
                name: this._id
            },
            http: {
                url: "https://proxy.bespoken.tools",
            },
            path: "/",
            pipeType: "HTTP",
            proxy: true
        };
    }
}
