var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context) {
    // Call a method that does not exist, make sure it does not crash
    context.doesNotExist.call();
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context);
};