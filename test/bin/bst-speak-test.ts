/// <reference path="../../typings/index.d.ts" />

import * as assert from "assert";
import * as mockery from "mockery";
import * as program from "commander";
import * as sinon from "sinon";
import {URLMangler} from "../../lib/client/url-mangler";
import {Global} from "../../lib/core/global";
import {NodeUtil} from "../../lib/core/node-util";
import {BSTProcess} from "../../lib/client/bst-config";
import SinonSandbox = Sinon.SinonSandbox;

describe("bst-speak", function() {
    let globalModule = {
        Global: {
            initializeCLI: function () {

            },

            running : function() {
                let p = new BSTProcess();
                p.port = 9999;
                return p;
            },

            version: function () {
                return "0.0.0";
            }
        }
    };

    let sandbox: SinonSandbox = null;
    beforeEach(function () {
        mockery.enable({useCleanCache: true});
        mockery.warnOnUnregistered(false);
        mockery.registerMock("../lib/core/global", globalModule);
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
        mockery.disable();
    });

    describe("speak command", function() {
        it("Speaks One Word", function(done) {
            process.argv = command("node bst-speak.js Hello");
            mockery.registerMock("../lib/client/bst-speak", {
                BSTSpeak: function () {
                    this.initialize = function(ready: Function) {
                        ready();
                    };

                    this.speak = function (utterance: string, callback: any) {
                        assert.equal(utterance, "Hello");
                        callback({"request": "test"}, {"response": "test"});
                    };
                }
            });

            let count = 0;
            sandbox.stub(console, "log", function(data: Buffer) {
                count++;
                if (count === 4) {
                    assert(data.toString().indexOf("response") !== -1);
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks With Custom URL", function(done) {
            process.argv = command("node bst-speak.js Hello --url https://proxy.bespoken.tools");
            mockery.registerMock("../lib/client/bst-speak", {
                BSTSpeak: function (url: string) {
                    this.url = url;
                    this.initialize = function(ready: Function) {
                        assert.equal(this.url, "https://proxy.bespoken.tools");
                        ready();
                        done();
                    };

                    this.speak = function (utterance: string, callback: any) {};
                }
            });

            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks One Word With Verbose", function(done) {
            process.argv = command("node bst-speak.js Hello -v");
            mockery.registerMock("../lib/client/bst-speak", {
                BSTSpeak: function () {
                    this.initialize = function(ready: Function) {
                        ready();
                    };

                    this.speak = function (utterance: string, callback: any) {
                        assert.equal(utterance, "Hello");
                        callback({"request": "test"}, {"response": "test"});
                    };
                }
            });

            let count = 0;
            sandbox.stub(console, "log", function(data: Buffer) {
                count++;
                if (count === 4) {
                    assert(data.toString().indexOf("request") !== -1);
                    done();
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Speaks Multiple Word", function(done) {
            process.argv = command("node bst-speak.js Hello There Ladies And Gentlemen");
            mockery.registerMock("../lib/client/bst-speak", {
                BSTSpeak: function () {
                    this.initialize = function(ready: Function) {
                        ready();
                    };

                    this.speak = function (utterance: string) {
                        assert.equal(utterance, "Hello There Ladies And Gentlemen");
                        done();
                        return this;
                    };
                }
            });
            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Has no interaction model", function(done) {
            process.argv = command("node bst-speak.js Hello There Ladies And Gentlemen");
            mockery.registerMock("../lib/client/bst-speak", {
                BSTSpeak: function () {
                    this.initialize = function(ready: Function) {
                        ready("There was an error");
                    };

                    this.speak = function (utterance: string) {
                        assert.equal(utterance, "Hello There Ladies And Gentlemen");
                        return this;
                    };
                }
            });

            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
                done();
            });

            NodeUtil.load("../../bin/bst-speak.js");
        });

        it("Has No Process", function(done) {
            sandbox.stub(process, "exit", function(exitCode: number) {
                assert.equal(exitCode, 0);
            });

            let count = 0;
            sandbox.stub(console, "log", function(data: Buffer) {
                count++;
                if (count === 5) {
                    assert(data.toString().indexOf("proxy is running") !== -1);
                    done();
                }
            });

            process.argv = command("node bst-speak.js Hello There Ladies And Gentlemen");
            // Prints out error if no process running
            globalModule.Global.running = function () {
                return null;
            };

            NodeUtil.load("../../bin/bst-speak.js");
        });
    });
});

let command = function (command: string): Array<string> {
    return command.split(" ");
};