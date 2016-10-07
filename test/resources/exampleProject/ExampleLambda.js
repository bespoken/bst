var module = require("./ExampleModule");
var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context) {
    var em = new module.ExampleModule("test");
    if (event.doFailure !== undefined && event.doFailure === true) {
        context.fail("Failure!");
    } else if (event.request !== undefined && event.request.intent !== undefined) {
        if (event.request.intent.name === "HelloIntent") {
            var responseData = {"success": true, "output": "Well, Hello To You"}
            context.succeed(responseData);
        } else if (event.request.intent.name === "ErrorIntent") {
            throw new Error("Error");
        } else {
            var responseData = {"success": true, "intent": event.request.intent.name }
            context.succeed(responseData);
        }
    } else if (event.request !== undefined && event.request.type === 'LaunchRequest') {
        context.succeed({"launched": true});
    } else if (event.request !== undefined && event.request.type === 'SessionEndedRequest') {
        context.succeed({"ended": true});
    } else {
        var value = em.loop(1000, 0);
        var responseData = {"success": true, "math": value}
        context.succeed(responseData);
    }

}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context);
};