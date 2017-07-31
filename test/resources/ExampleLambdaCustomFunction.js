var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context) {
    if (event.doFailure !== undefined && event.doFailure === true) {
        context.fail(new Error("Failure!"));
    } else {
        var responseData = {"success": true}
        context.succeed(responseData);
    }

}

// Create the handler that responds to the Alexa Request.
exports.myHandler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context);
};