import * as assert from "assert";
import {LambdaServer} from "../../lib/client/lambda-server";
import {HTTPClient} from "../../lib/core/http-client";
import {Global} from "../../lib/core/global";

describe("LambdaServer", function() {
    before(function () {
        Global.initialize();
    });

    beforeEach(function () {
        process.chdir("test/resources");
    });

    afterEach(function () {
        process.chdir("../..");
    });

    describe("#start()", function() {
        it("Starts Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "{\"success\":true}");
                runner.stop();
                done();
            });

        });

        it("Starts Correctly With a custom function", function(done) {
            let runner = new LambdaServer("ExampleLambdaCustomFunction.js", 10000, false, "myHandler");
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "{\"success\":true}");
                runner.stop();
                done();
            });

        });

        it("Starts Correctly With a custom function with strange characters", function(done) {
            let runner = new LambdaServer("ExampleLambdaCustomFunction.js", 10000, false, "myHandler");
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Testü"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "{\"success\":true}");
                runner.stop();
                done();
            });

        });

        it("Handles Lambda Fail Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", "doFailure": true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "Unhandled Exception from Lambda: Error: Failure!");
                runner.stop();
                done();
            });
        });

        it("Handles Lambda Exception Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambdaBad.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", "doFailure": true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let responseString = data.toString();
                assert.equal(responseString, "Unhandled Exception from Lambda: TypeError: Cannot read property 'call' of undefined");
                runner.stop();
                done();
            });
        });

        it("Handles Project Correctly", function(done) {
            process.chdir("exampleProject");
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
                runner.stop();
                process.chdir("..");
                done();
            });
        });

        it("Handles Project Correctly Different Dir", function(done) {
            let runner = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
                runner.stop();
                done();
            });
        });

        it("Uses Callback Successfully", function(done) {
            let runner = new LambdaServer("CallbackLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert(true, o.success);
                runner.stop();
                done();
            });
        });

        it("Uses Callback With Failure", function(done) {
            let runner = new LambdaServer("CallbackLambda", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", doFailure: true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                assert.equal(data.toString(), "Unhandled Exception from Lambda: Error: Failed!");
                runner.stop();
                done();
            });
        });

        it("Invoke uses URL to find module when URL is present", function(done) {
            let runner = new LambdaServer(null, 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "/exampleProject/ExampleLambda.handler", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert(true, o.success);
                runner.stop();
                done();
            });
        });

        it("Invoke with URL of valid module and invalid handler should raise error", function(done) {
            let runner = new LambdaServer(null, 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "/exampleProject/ExampleLambda.fakehandler", JSON.stringify(inputData), function(data: Buffer) {
                assert.equal(data.toString(), "Unhandled Exception from Lambda: TypeError: lambda[handlerFunction] is not a function");
                runner.stop();
                done();
            });
        });

        it("Invoke with url containing node_modules should raise error", function(done) {
            let runner = new LambdaServer(null, 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "/node_modules/exampleProject/ExampleLambda.fakeHandler", JSON.stringify(inputData), function(data: Buffer) {
                assert.equal(data.toString(), "Unhandled Exception from Lambda: Error: LambdaServer input url should not contain more than '.' or node_modules.  found: /node_modules/exampleProject/ExampleLambda.fakeHandler");
                runner.stop();
                done();
            });
        });

        it("Invoke with url containing more than one '.' should raise error", function(done) {
            let runner = new LambdaServer(null, 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "/./exampleProject/ExampleLambda.fakeHandler", JSON.stringify(inputData), function(data: Buffer) {
                assert.equal(data.toString(), "Unhandled Exception from Lambda: Error: LambdaServer input url should not contain more than '.' or node_modules.  found: /./exampleProject/ExampleLambda.fakeHandler");
                runner.stop();
                done();
            });
        });

        it("Invoke without url and file should return error", function(done) {
            let runner = new LambdaServer(null, 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                assert.equal(data.toString(), "Unhandled Exception from Lambda: Error: You should provide the lambda file or pass it in the url");
                runner.stop();
                done();
            });
        });


        it("Checks Context Stuff", function(done) {
            let runner = new LambdaServer("ContextLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test", doFailure: true};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                runner.stop();
                done();
            });
        });

        it("Handles Two at once", function(done) {
            let runner = new LambdaServer("exampleProject/ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
            });

            client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer) {
                let o: any = JSON.parse(data.toString());
                assert.equal(true, o.success);
                assert.equal(2000, o.math);
                runner.stop();
                done();
            });
        });

        it("Handles Ping", function(done) {
            let tempFile = "ExampleLambdaCopy.js";
            let runner = new LambdaServer(tempFile, 10000);

            runner.start(function () {
                new HTTPClient().get("localhost", 10000, "/localPing", function (data: Buffer, statusCode: number) {
                    assert.equal(statusCode, 200);
                    assert.equal(data.length, 5);
                    runner.stop(function () {
                        done();
                    });
                });
            });
        });


        it("Handles Get", function(done) {
            let tempFile = "GetMethodLambda.js";
            let runner = new LambdaServer(tempFile, 10000);

            runner.start(function () {
                new HTTPClient().get("localhost", 10000, "", function (data: Buffer, statusCode: number) {
                    let responseString = data.toString();
                    console.log("Response: ", responseString);
                    assert.equal(statusCode, 200);

                    assert.equal(responseString, "{\"success\":true}");
                    runner.stop();
                    done();
                });
            });
        });
    });

    describe("#stop()", function() {
        it("Stops Correctly", function(done) {
            let runner = new LambdaServer("ExampleLambda.js", 10000);
            runner.start();

            let client = new HTTPClient();
            let inputData = {"data": "Test"};
            client.post("localhost", 10000, "", JSON.stringify(inputData), function() {
                runner.stop();
                client.post("localhost", 10000, "", JSON.stringify(inputData), function(data: Buffer, statusCode: number, success: boolean) {
                    assert.equal(data.toString().indexOf("connect ECONNREFUSED") !== -1, true);
                    assert.equal(success, false);
                    done();
                });
            });

        });
    });
});