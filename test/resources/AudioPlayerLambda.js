var AudioPlayerLambda = function () {

};

var count = 0;
AudioPlayerLambda.execute = function (event, context) {
    count++;
    var token = count + "";
    if (event.noop !== undefined && event.noop === true) {
        // Do nothing
    } else {
        var responseData = {
            version: "1.0",
            response: {
                shouldEndSession: true,
                directives: [
                    {
                        type: "AudioPlayer.Play",
                        playBehavior: "ENQUEUE",
                        audioItem: {
                            stream: {
                                url: "https://d2mxb5cuq6ityb.cloudfront.net/Brand_Haiku-Two-1dac62f8-8160-4aa3-9fd9-535e31f96719.m4a",
                                token: token,
                                expectedPreviousToken: "0",
                                offsetInMilliseconds: 0
                            }
                        }
                    }
                ]
            }
        };
        context.succeed(responseData);
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var lambda = new AudioPlayerLambda();
    AudioPlayerLambda.execute(event, context);
};