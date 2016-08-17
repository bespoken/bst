var module = require("./ExampleModule");
var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context) {
    var em = new module.ExampleModule("test");
    if (event.doFailure !== undefined && event.doFailure === true) {
        context.fail("Failure!");
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