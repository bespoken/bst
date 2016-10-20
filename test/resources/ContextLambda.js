var assert = require('assert');
// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context, callback) {
    // Create an instance of the HelloWorld skill.
    assert(context.request);
    assert(context.getRemainingTimeMillis());
    assert.equal(context.awsRequestId, "N/A");
    assert(context.callbackWaitsForEmptyEventLoop);
    assert.equal(context.functionName, "BST.LambdaServer");
    assert.equal(context.functionVersion, "N/A");
    assert.equal(context.memoryLimitInMB, -1);
    assert.equal(context.invokedFunctionArn, "N/A");
    assert.equal(context.logGroupName, "N/A");
    assert.equal(context.logStreamName, null);
    assert.equal(context.identity, null);
    assert.equal(context.clientContext, null);
    context.succeed({});
};