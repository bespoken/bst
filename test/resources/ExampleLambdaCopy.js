var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context) {
    if (event.doFailure !== undefined && event.doFailure === true) {
        context.fail("Failure!");
    } else {
        var responseData = {"success": true, "reloaded": true}
        context.succeed(responseData);
    }

}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context);
};