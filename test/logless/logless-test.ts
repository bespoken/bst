import * as sinon from "sinon";
import * as assert from "assert";
import {Logless} from "../../lib/logless/logless";
import {LoglessContext} from "../../lib/logless/logless-context";
import {Response} from "express/lib/response";
import {Request} from "express/lib/request";
import {Server} from "http";
import {HTTPClient} from "../../lib/core/http-client";
import {Application} from "express/lib/application";
const express = require("express");
const bodyParser = require("body-parser");

describe("Logless", function() {
    let uncaughtExceptionHandler: (...args: any[]) => void = null;
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

    describe("Logless Context", function () {
        it("Works if a context already exists", function () {
            const createNamespace = require("continuation-local-storage").createNamespace;
            createNamespace("my session");

            const context = new LoglessContext("Logger");

            // This throws on failing validation of continuation-local-storage
            try {
                context.captureConsole(() => {});
            } catch (error) {
                assert(false);
            }
            assert(true);
        });
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
                    assert.equal(json.transaction_id.length, 36);
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

    describe("Logging Using the Cloud Functions", function () {
        it("Logs real stuff", function (done) {
            // Put all our verification stuff here - this gets called inside the Cloud Function
            const onCall = function (request: any) {
                const flush = request.logger.flush;

                let flushCount = 0;
                // Make sure flush is called only once
                request.logger.flush = function (onFlush: Function) {
                    flushCount++;
                    if (flushCount > 1) {
                        assert(false, "Flushed called more than once");
                    }
                    flush.call(request.logger, onFlush);
                    request.logger.flush = flush;
                };

                // Verify logs that are transmitted by mocking logger.transmit
                verifyLogger(request.logger, function (json: any) {
                    assert.equal(json.source, "JPK");
                    assert.equal(json.transaction_id.length, 36);
                    assert.equal(json.logs.length, 7);
                    assert(json.logs[0].payload.bodyValue);
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
                    done();
                });
            };

            // Emulate a cloud function
            const handler: any = Logless.capture("JPK", function (request: any, response: any) {
                onCall(request);
                console.log("I am a log with %s %s", "Test", "Test2");
                console.info("I am info");
                console.warn("I am a warning");
                console.error("I am an error");
                console.info();
                response.json({response: true, key: "value"});
            });

            handler.call(this, {body: {bodyValue: true}}, new MockResponse());
        });

        it("Logs stuff on exception", function (done) {
            let response = new MockResponse();
            response.end = function () {
                assert(false, "This should not be called here");
            };

            // Done, Succeed or Fail are not called?
            const handler: any = Logless.capture("JPK", function (request: any, response: any) {
                verifyLogger(request.logger, function (json: any) {
                    assert.equal(json.source, "JPK");
                    assert.equal(json.logs[0].payload.request, true);
                    assert.equal(json.logs[1].payload, "Error: Test");
                    assert(json.logs[1].stack);
                    done();
                });

                throw new Error("Test");
            });

            handler.call(this, {body: {request: true}}, response);
        });

        it("Logs stuff on uncaught exception", function (done) {
            let response = new MockResponse();
            response.end = function () {
                done();
            };

            // Flush gets called twice on just random uncaught exception
            // This is an exception that does not bubble up but just dies on a callback
            const handler: any = Logless.capture("JPK", function (request: any, response: any) {
                let flushes = 0;
                verifyLogger(request.logger, function (json: any) {
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
                    response.json({response: true});
                }, 10);
            });

            handler.call(this, {body: {request: true}}, response);
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
                    assert(json.logs[2].stack.startsWith("Error: ERROR\n    at FunctionWrapper.wrappedFunction"));
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
                    assert(json.logs[1].stack.startsWith("SystemError: ERROR\n    at FunctionWrapper.wrappedFunction"));
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
            let context = new MockContext();
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

describe("Logless Express Tests", function () {
    let server: Server = null;
    let app: Application = null;

    beforeEach(function(done) {
        done();
    });

    afterEach(function(done) {
        server.close(function () {
            done();
        });
    });

    it("Captures request and response", function(done) {
        const client = new HTTPClient();
        const handler = Logless.middleware("1b7d6d1d-d214-4770-a3fd-4ee6c7ffab3b");

        app = express();

        app.use(bodyParser.json(), handler.requestHandler);

        app.post("/", function (request: Request, response: Response) {
            response.send("Hello World!");
        });

        server = app.listen(3000, function () {
            console.log("Example app listening on port 3000!");
        });

        // logger variable gets set on the handler so we can write tests like this
        verifyLogger((<any> handler.requestHandler).logger, function(data: any) {
            assert.equal(data.logs.length, 2);
            assert.equal(data.logs[0].tags.length, 1);
            assert.equal(data.logs[0].tags[0], "request");
            done();
        });

        client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
            console.log("Response: " + data.toString());
        });
    });

    it("Captures request and response JSON", function(done) {
        const client = new HTTPClient();
        const handler = Logless.middleware("1b7d6d1d-d214-4770-a3fd-4ee6c7ffab3b");

        app = express();

        app.use(bodyParser.json(), handler.requestHandler);

        app.post("/", function (request: Request, response: Response) {
            response.contentType("application/json");
            response.send(JSON.stringify({ test: { a: "b" }}));
        });

        server = app.listen(3000, function () {
            console.log("Example app listening on port 3000!");
        });

        // logger variable gets set on the handler so we can write tests like this
        verifyLogger((<any> handler.requestHandler).logger, function(data: any) {
            assert.equal(data.logs.length, 2);
            assert.equal(data.logs[0].tags.length, 1);
            assert.equal(data.logs[0].tags[0], "request");
            assert.equal(data.logs[1].payload.test.a, "b");
            assert.equal(data.logs[1].tags[0], "response");
            done();
        });

        client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
            console.log("Response: " + data.toString());
        });
    });

    it("Captures two requests and responses", function(done) {
        const client = new HTTPClient();
        const handler = Logless.middleware("1b7d6d1d-d214-4770-a3fd-4ee6c7ffab3b");

        app = express();

        app.use(bodyParser.json(), handler.requestHandler);

        app.post("/", function (request: Request, response: Response) {
            response.contentType("application/json");
            response.send(JSON.stringify({ test: { a: "b" }}));
        });

        server = app.listen(3000, function () {
            console.log("Example app listening on port 3000!");
        });

        let uuid = null;
        // Make sure transaction ID changes between calls
        verifyLogger((<any> handler.requestHandler).logger, function(data: any) {
            if (uuid === null) {
                uuid = data.transaction_id;
            } else {
                console.log("UUID: " + uuid + " NEW: " + data.transaction_id);
                assert.notEqual(uuid, data.transacton_id);
                done();
            }
        });

        client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
            client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
                console.log("Response: " + data.toString());
            });
        });

    });

    it("Captures console", function(done) {
        const client = new HTTPClient();
        Logless.enableConsoleLogging();
        const handlers = Logless.middleware("1b7d6d1d-d214-4770-a3fd-4ee6c7ffab3b");

        app = express();
        app.use(bodyParser.json());
        app.use(handlers.requestHandler);

        app.post("/", function (request: Request, response: Response) {
            console.log("LogTest");
            console.error("ErrorTest");

            response.contentType("application/json");
            response.send(JSON.stringify({ test: { a: "b" }}));
        });

        server = app.listen(3000, function () {
            console.log("Example app listening on port 3000!");
        });

        // We use a counter because we do two simultaneous requests
        // Each request should go to the correct transaction
        let count = 0;
        // logger variable gets set on the handler so we can write tests like this
        verifyLogger((<any> handlers.requestHandler).logger, function(data: any) {
            assert.equal(data.logs.length, 4);
            assert.equal(data.logs[0].tags.length, 1);
            assert.equal(data.logs[0].tags[0], "request");
            assert.equal(data.logs[1].payload, "LogTest");
            assert.equal(data.logs[1].log_type, "DEBUG");
            assert.equal(data.logs[2].payload, "ErrorTest");
            assert.equal(data.logs[2].log_type, "ERROR");
            assert.equal(data.logs[3].payload.test.a, "b");
            assert.equal(data.logs[3].tags[0], "response");

            count++;
            if (count === 2) {
                done();
            }
        });

        client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
            console.log("Response: " + data.toString());
        });

        client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
            console.log("Response: " + data.toString());
        });
    });

    it("Captures errors", function(done) {
        const client = new HTTPClient();
        Logless.enableConsoleLogging();
        const middleware = Logless.middleware("1b7d6d1d-d214-4770-a3fd-4ee6c7ffab3b");

        app = express();
        app.use(bodyParser.json());
        app.use(middleware.requestHandler);

        app.post("/", function (request: Request, response: Response) {
            throw new Error("Exception");
        });

        app.use(middleware.errorHandler);

        server = app.listen(3000, function () {
            console.log("Example app listening on port 3000!");
        });


        // logger variable gets set on the handler so we can write tests like this
        verifyLogger((<any> middleware.requestHandler).logger, function(data: any) {
            assert.equal(data.logs.length, 3);
            assert.equal(data.logs[0].tags.length, 1);
            assert.equal(data.logs[0].tags[0], "request");
            assert.equal(data.logs[1].payload, "Error: Exception");
            assert.equal(data.logs[1].log_type, "ERROR");
            assert(data.logs[1].stack);
            assert.equal(data.logs[2].tags.length, 1);
            assert.equal(data.logs[2].payload.trim().includes( "Cannot POST /"), true);
            assert.equal(data.logs[2].tags[0], "response");
            done();
        });

        client.post("localhost", 3000, "/", JSON.stringify({ test: "value" }), function(data, statusCode) {
            console.log("Response: " + data.toString());
        });
    });
});

class MockContext {
    public awsRequestId: string = null;

    done (error: Error, result?: any) {

    }

    succeed (result: any) {
        this.done(null, result);
    }

    fail (error: Error) {
        this.done(error);
    }
};


class MockResponse {
    public headers: {[id: string]: string} = {};

    get(header: string) {
        return this.headers[header];
    }

    json(data: any) {
        this.headers["Content-Type"] = "application/json";
        this.end(new Buffer(JSON.stringify(data)));
    }

    end(data: Buffer) {

    };
};

function verifyLogger(logger: LoglessContext, verify: Function) {
    logger.transmit = function(data: any, flushed: () => void) {
        verify(data);
        if (flushed !== undefined) {
            flushed();
        }
    };
}
