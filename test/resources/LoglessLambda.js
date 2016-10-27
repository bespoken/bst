
exports.handler = Logless.capture("JPK", function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context);
});

exports.handler = Logless.capture(exports.handler);