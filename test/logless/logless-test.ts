/// <reference path="../../typings/index.d.ts" />

import * as sinon from "sinon";
import * as assert from "assert";
import {Logless} from "../../lib/logless/logless";
import {LoglessContext} from "../../lib/logless/logless-context";

describe("Logless", function() {
    let uncaughtExceptionHandler: Function = null;
    let sandbox: any = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(console, "log", function () {});
        sandbox.stub(console, "info", function () {});
        sandbox.stub(console, "error", function () {});
        sandbox.stub(console, "warn", function () {});

        uncaughtExceptionHandler = process.listeners("uncaughtException").pop();
        process.removeListener("uncaughtException", uncaughtExceptionHandler);
    });

    afterEach(function () {
        sandbox.restore();

        process.addListener("uncaughtException", uncaughtExceptionHandler);
    });

    describe("Logging Using the Lambda Context", function () {
        it("Logs real stuff", function (done) {
            let context = new MockContext();
            context.awsRequestId = "FakeAWSRequestId";
            context.done = function (error: Error, result: any) {
                assert(result);
                done();
            };

            const onCall = function (context: any) {
                const flush = context.logger.flush;

                let flushCount = 0;
                context.logger.flush = function (onFlush: Function) {
                    flushCount++;
                    if (flushCount > 1) {
                        assert(false, "Flushed called more than once");
                    }
                    flush.call(context.logger, onFlush);
                    context.logger.flush = flush;
                };

                verifyLogger(context.logger, function (json: any) {
                    assert.equal(json.source, "JPK");
                    assert.equal(json.transaction_id, "FakeAWSRequestId");
                    assert.equal(json.logs.length, 7);
                    assert(json.logs[0].payload.request);
                    assert.equal(json.logs[0].log_type, "INFO");
                    assert.strictEqual(json.logs[0].tags[0], "request");
                    assert.strictEqual(json.logs[1].payload, "I am a log with Test Test2");
                    assert.equal(json.logs[1].log_type, "DEBUG");
                    assert.equal(json.logs[2].payload, "I am info");
                    assert.equal(json.logs[2].log_type, "INFO");
                    assert.equal(json.logs[3].timestamp.length, 24);
                    assert.equal(json.logs[3].log_type, "WARN");
                    assert.equal(json.logs[4].log_type, "ERROR");
                    assert.equal(json.logs[5].log_type, "INFO");
                    assert.equal(json.logs[5].payload, null);
                    assert(json.logs[6].payload.response);
                    assert(json.logs[6].payload.key, "value");
                    assert.strictEqual(json.logs[6].tags[0], "response");
                });
            };

            // Emulate a lambda function
            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                onCall(context);
                console.log("I am a log with %s %s", "Test", "Test2");
                console.info("I am info");
                console.warn("I am a warning");
                console.error("I am an error");
                console.info();
                context.done(null, {response: true, key: "value"});
            });

            handler.call(this, {request: true}, context);
        });


        it("Logs stuff on done with error", function (done) {
            let context = new MockContext();
            context.done = function (error: Error, result: any) {
                assert(error);
                assert(result);
                done();
            };

            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                verifyLogger(context.logger, function (json: any) {
                    assert.equal(json.transaction_id.length, 36);
                    assert.equal(json.source, "JPK");
                    assert.equal(json.logs.length, 2);
                    assert.equal(json.logs[1].log_type, "ERROR");
                    assert.equal(json.logs[1].payload, "Error: TestError");
                });

                context.done(new Error("TestError"), {"response": true});
            });


            handler.call(this, {request: true}, context);
        });

        it("Logs stuff on succeed", function (done) {
            let context = new MockContext();
            context.done = function (error: Error, result: any) {
                assert(result);
                assert(result.response);
                done();
            };

            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                verifyLogger(context.logger, function (json: any) {
                    assert.equal(json.logs.length, 2);
                });

                // Want to make sure context.done is called on the Lambda via chain from calling success
                context.succeed({"response": true});
            });

            handler.call(this, {request: true}, context);
        });

        it("Logs stuff on fail", function (done) {
            let context = new MockContext();
            context.done = function (error: Error) {
                assert(error);
                assert.equal(error.message, "Test");
                done();
            };

            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                verifyLogger(context.logger, function (json: any) {
                    assert.equal(json.logs.length, 2);
                });

                context.fail(new Error("Test"));
            });

            handler.call(this, {request: true}, context);
        });

        it("Throws error if there is no handler passed", function (done) {
            try {
                Logless.capture("JPK", null);
                assert(false, "Should not get here");
            } catch (e) {
                assert(e);
                assert(e.message.startsWith("Handler is null"));
                done();
            }
        });

        it("Logs stuff on timer", function (done) {
            let context = new MockContext();
            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                console.time("TestTimer");

                verifyLogger(context.logger, function (json: any) {
                    assert.equal(json.transaction_id.length, 36);
                    assert.equal(json.source, "JPK");
                    assert.equal(json.logs.length, 3);
                    assert.equal(json.logs[1].log_type, "DEBUG");
                    assert(json.logs[1].payload.startsWith("TestTimer:"));
                    assert(json.logs[1].payload.endsWith("ms"));
                    done();
                });

                setTimeout(function () {
                    console.timeEnd("TestTimer");
                    context.done(null, {"response": true});
                }, 10);
            });

            handler.call(this, {request: true}, context);
        });
    });

    describe("Handles Exceptions", function () {
        it("Logs stuff on exception", function (done) {
            let context = new MockContext();
            context.done = function () {
                assert(false, "This should not be called here");
            };

            // Done, Succeed or Fail are not called?
            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                verifyLogger(context.logger, function (json: any) {
                    assert.equal(json.source, "JPK");
                    assert.equal(json.logs[0].payload.request, true);
                    assert.equal(json.logs[1].payload, "Error: Test");
                    assert(json.logs[1].stack);
                    done();
                });

                throw new Error("Test");
            });

            handler.call(this, {request: true}, context);
        });

        it("Logs stuff on throws a string", function (done) {
            let context = new MockContext();
            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                verifyLogger(context.logger, function(json: any) {
                    assert.equal(json.source, "JPK");
                    assert.equal(json.logs[0].payload.request, true);
                    assert.equal(json.logs[1].payload, "Error As String");
                    assert.equal(json.logs[1].log_type, "ERROR");
                    assert(!json.logs[1].stack);
                    done();
                });

                throw "Error As String";
            });

            handler.call(this, {request: true}, context);
        });

        it("Logs stuff on uncaught exception", function (done) {
            let context = new MockContext();
            context.done = function () {
                done();
            };

            // Flush gets called twice on just random uncaught exception
            // This is an exception that does not bubble up but just dies on a callback
            const handler: any = Logless.capture("JPK", function (event: any, context: any) {
                let flushes = 0;
                verifyLogger(context.logger, function (json: any) {
                    flushes++;
                    if (flushes === 1) {
                        assert.equal(json.source, "JPK");
                        assert.equal(json.logs.length, 2);
                        assert.equal(json.logs[0].payload.request, true);
                        assert.equal(json.logs[1].payload, "Error: Test");
                        assert(json.logs[1].stack);
                    } else {
                        assert.equal(json.logs.length, 2);
                        assert.equal(json.logs[0].payload, "TestLog");
                        assert.equal(json.logs[1].payload.response, true);
                    }
                });

                setTimeout(function () {
                    throw Error("Test");
                }, 5);

                setTimeout(function () {
                    console.log("TestLog");
                    context.done(null, {response: true});
                }, 10);
            });

            handler.call(this, {request: true}, context);
        });
    });

    describe("Logging Stuff on Callback", function () {
        it("Logs stuff on callback with results", function (done) {
            let context = new MockContext();

            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                verifyLogger(context.logger, function(json: any) {
                    assert.equal(json.source, "JPK");
                    assert.equal(json.transaction_id.length, 36);
                    assert.equal(json.logs.length, 3);
                    assert.strictEqual(json.logs[0].payload.request, true);
                    assert.strictEqual(json.logs[1].payload, "I am a log");
                    assert.strictEqual(json.logs[2].payload.response, true);
                    assert.strictEqual(json.logs[2].tags[0], "response");
                });

                console.log("I am a log");
                callback(null, {response: true, callback: "Test"});
            });

            handler.call(this, {request: true}, context, function (error: Error, result: any) {
                assert(result);
                assert(result.response);
                assert.equal(result.callback, "Test");
                done();
            });
        });

        it("Logs stuff on callback with 'plain' error", function (done) {
            let context = new MockContext();
            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                verifyLogger(context.logger, function(json: any) {
                    console.log(JSON.stringify(json, null, 2));
                    assert.equal(json.source, "JPK");
                    assert.equal(json.logs.length, 3);
                    assert.strictEqual(json.logs[0].payload.request, true);
                    assert.strictEqual(json.logs[1].payload, "I am a log");
                    assert.strictEqual(json.logs[2].payload, "Error: ERROR");
                    assert.strictEqual(json.logs[2].tags[0], "response");
                    assert.strictEqual(json.logs[2].log_type, "ERROR");
                    assert(json.logs[2].stack.startsWith("Error: ERROR\n    at LambdaWrapper.wrappedLambda"));
                    done();
                });

                console.log("I am a log");
                callback(new Error("ERROR"));
            });

            handler.call(this, {request: true}, context, function (error: Error, result: any) {});
        });

        it("Logs stuff on callback with system error", function (done) {
            let context = new MockContext();
            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                verifyLogger(context.logger, function (json: any) {
                    console.log(JSON.stringify(json, null, 2));
                    assert.strictEqual(json.logs[1].tags[0], "response");
                    assert.strictEqual(json.logs[1].log_type, "ERROR");
                    assert.strictEqual(json.logs[1].payload, "SystemError: ERROR code: EACCESS syscall: Syscall");
                    assert(json.logs[1].stack.startsWith("SystemError: ERROR\n    at LambdaWrapper.wrappedLambda"));
                    done();
                });

                const error: any = new Error("ERROR");
                error.name = "SystemError";
                error.code = "EACCESS";
                error.syscall = "Syscall";
                callback(error);
            });

            handler.call(this, {request: true}, context, function (error: Error, result: any) {});
        });
    });

    describe("#cleanup()", function() {
        it("Removes the correct listener on callback", function (done) {
            assert.equal(process.listenerCount("uncaughtException"), 0);
            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                assert.equal(process.listenerCount("uncaughtException"), 1);
                callback(null, { response: true });
            });

            handler.call(this, {request: true}, context, function (error: Error, result: any) {
                assert.equal(process.listenerCount("uncaughtException"), 0);
                done();
            });
        });

        it("Removes the correct listener on done", function (done) {
            let context = new MockContext();
            context.done = function (error: Error, result: any) {
                assert.equal(process.listenerCount("uncaughtException"), 0);
                done();
            };

            assert.equal(process.listenerCount("uncaughtException"), 0);
            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                assert.equal(process.listenerCount("uncaughtException"), 1);
                context.done(null, { response: true });
            });

            handler.call(this, {request: true}, context);
        });

        it("Removes the correct listener on exception", function (done) {
            let context = new MockContext();

            assert.equal(process.listenerCount("uncaughtException"), 0);
            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                assert.equal(process.listenerCount("uncaughtException"), 1);
                throw new Error("This is a an error");
            });

            handler.call(this, {request: true}, context);
            assert.equal(process.listenerCount("uncaughtException"), 0);
            done();
        });
    });

    describe("Network Issues", function() {
        it("Handles wrong domain", function (done) {
            Logless.Domain = "cnn.com";
            let context = new MockContext();
            context.done = function () {
                done();
            };

            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                context.done(null, {});
            });

            handler.call(this, {request: true}, context);
        });

        it("Handles non-response domain", function (done) {
            Logless.Domain = "cnndoesnotexist.com";
            let context = new MockContext();
            context.done = function () {
                done();
            };

            const handler: any = Logless.capture("JPK", function (event, context, callback) {
                context.done(null, {});
            });

            handler.call(this, {request: true}, context);
        });
    });
});

class MockContext {
    public awsRequestId: string;

    done (error: Error, result?: any) {

    }

    succeed (result: any) {
        this.done(null, result);
    }

    fail (error: Error) {
        this.done(error);
    }
};

function verifyLogger(logger: LoglessContext, verify: Function) {
    logger.transmit = function(data: any, flushed: () => void) {
        verify(data);
        if (flushed !== undefined) {
            flushed();
        }
    };
}