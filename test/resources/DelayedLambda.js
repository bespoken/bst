var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context) {
    setTimeout(function () {
        var responseData = {"success": true}
        context.succeed(responseData);
    }, 100);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context);
};