var ExampleLambda = function () {

};

ExampleLambda.execute = function (event, context, callback) {
    if (event.doFailure !== undefined && event.doFailure === true) {
        callback(new Error("Failed!"));
    } else {
        var responseData = {"success": true}
        callback(null, responseData);
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context, callback) {
    // Create an instance of the HelloWorld skill.
    var lambda = new ExampleLambda();
    ExampleLambda.execute(event, context, callback);
};