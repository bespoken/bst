// Create the handler that responds to the Alexa Request.
exports.handler = function (request, response) {
    let event = request.body;

    if (event.doException) {
        throw "What the heck happened!";
    } else if (event.doFailure) {
        response.status(500).send("Failure!");
    } else {
        var responseData = {"success": true};
        response.json(responseData);
    }
};