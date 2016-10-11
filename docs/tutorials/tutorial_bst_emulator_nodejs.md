This tutorial shows you how to get started using our BST Alexa emulator with Node.js and Javascript.  

The purpose of the emulator is to enable unit- and functional-testing of Alexa Skills, 
allowing one to:

* Emulate the complex behavior of the Alexa service, without an Alexa device or any manual interaction
* Ensure ongoing skill quality by embedding tests in Continuous Integration/Deployment processes

*And please note - though this example is written in Javascript, the emulator can be used to test non-Javascript-based skills!*

Additionally, though this example focuses on the AudioPlayer interface, 
the BSTAlexa emulator can be used for testing regular Alexa skills as well.

## Tutorial Prerequisites

* Mocha Test Framework
    * https://mochajs.org/#getting-started
    * `$ npm install mocha --save-dev`
* A Node.js, Lambda-based Alexa skill 
    * If you do not have one and want to follow along at home, [try ours here](https://github.com/bespoken/streamer).
    * Derived from excellent streaming skill example provided by Amazon.
    * The test used in this tutorial is [found here](https://github.com/bespoken/streamer/blob/master/test/streamerTest.js).
* Bespoken Tools added to your project's package.json
    * `$ npm install bespoken-tools --save-dev`
    * For this example, we make it a "dev" dependency as we will be using it only for testing.

## Test Structure

We are using Mocha for tests. We breakdown our tests into three parts:

* beforeEach - Creates a local Lambda server and initializes the emulator
* tests - Performs the actual tests by issuing intents and emulating AudioPlayer behavior
* afterEach - Tears down the local Lambda server and shuts down the emulator

These are standard testing considerations, *though we emphasize the importance of stopping the Lambda server.*
If this is not done, it will continue listening on the assigned port, potentially causing conflicts and errors.

## Adding the bst module
At the top of your test, include:
```
var bst = require('bespoken-tools');
```

## Setup and Teardown

```
var server = null;
var alexa = null;

beforeEach(function (done) {
    server = new bst.LambdaServer('./index.js', 10000, true);
    alexa = new bst.BSTAlexa('http://localhost:10000',
                             '../speechAssets/IntentSchema.json',
                             '../speechAssets/Utterances.txt');
    server.start(function() {
        alexa.start(function (error) {
            if (error !== undefined) {
                console.error("Error: " + error);
            } else {
                done();
            }
        });
    });
});

afterEach(function(done) {
    alexa.stop(function () {
        server.stop(function () {
            done();
        });
    });
});
```

The beforeEach block initializes the [LambdaServer](http://docs.bespoken.tools/en/latest/api/classes/lambdaserver.html) 
and the [BSTAlexa emulator](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html).

The first parameter to the LambdaServer tells it the location of the Lambda file to be run.
It automatically wraps the Lambda in a service, and exposes it on the port supplied in the second argument.

The last parameter indicates it should be in verbose mode - this causes requests and responses from the skill to be printed to the console.

The [BSTAlexa start call](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html#start) takes the URL of the Lambda server as its first parameter (it begins listening).  
*Note that if you are not using Lambdas but a "Plain Old HTTP Service" you can skip the server start call and just point it at a server here.*

Additionally, it takes the location of the Intent Schema and Utterances in the second and third parameters. 
These are not required and will default to './speechAssets/IntentSchema.json' and './speechAssets/SampleUtterances.txt' respectively.

The afterEach block ensures the LambdaServer and BSTAlexa emulator are shutdown correctly.

## First Simple Test

```
it('Launches and then plays first', function (done) {
    // Launch the skill via sending it a LaunchRequest
    alexa.launched(function (error, payload) {
        // Check that the introduction is play as outputSpeech
        assert.equal(payload.response.outputSpeech.ssml, '<speak> <audio src="https://s3.amazonaws.com/bespoken/streaming/bespokenspodcast-INTRODUCTION.mp3" />You can say play, scan titles, or about the podcast </speak>');

        // Emulate the user saying 'Play'
        alexa.spoken('Play', function (error, payload) {
            // Ensure the correct directive and audioItem is returned
            assert.equal(payload.response.directives[0].type, 'AudioPlayer.Play');
            assert.equal(payload.response.directives[0].audioItem.stream.token, '0');
            assert.equal(payload.response.directives[0].audioItem.stream.url, 'https://traffic.libsyn.com/bespoken/TIP103.mp3?dest-id=432208');
            done();
        });
    });
});
```

This test runs through some simple behavior:

* It emulates the Skill being launched
* It confirms the Skill returns the correct outputSpeech after being launched
* It emulates the user saying 'Play'
* It confirms the correct directive and AudioItem is returned for the 'Play' intent

The goal is to test until we feel confident in the behavior of our skill, and that it is correctly handling the interaction with the Alexa Service.

It is a straightforward exercise to add more property checks on the payload to further confirm behavior.

## A More Complex Test

```
it('Plays And Goes To Next', function (done) {
    // Open the skill directly with a 'Play' intent
    alexa.spoken('Play', function (error, payload) {
        // Confirms the correct directive is returned when the Intent is spoken
        assert.equal(payload.response.directives[0].type, 'AudioPlayer.Play');

        // We want to make sure playback started
        //  This request comes from the Alexa service AFTER the AudioPlayer.Play directive is received
        //  Once gets triggered a single time when the specified event occurs
        alexa.once('AudioPlayer.PlaybackStarted', function (audioItem) {
            assert.equal(audioItem.stream.url, 'https://traffic.libsyn.com/bespoken/TIP103.mp3?dest-id=432208')
            done();
        });

        // Emulate the user saying 'Next'
        alexa.intended('AMAZON.NextIntent', null, function (error, response) {
            assert.equal(payload.response.directives[0].type, 'AudioPlayer.Play');
            assert.equal(payload.response.directives[0].audioItem.stream.token, '1');
            assert.equal(payload.response.directives[0].audioItem.stream.url, 'https://traffic.libsyn.com/bespoken/TIP104.mp3?dest-id=432208');
        });
    });
});
```

This test uses the [BSTAlexa#playbackFinished() call](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html#playbackfinished) 
to emulate the audio playing to completion on the device.  

The Alexa service first sends a 'AudioPlayer.PlaybackNearlyFinished' request to the skill. 
This request is frequently used by skills to enqueue the next AudioItem in the queue for playback on the device.

The Alexa service then sends a 'AudioPlayer.PlaybackFinished' request to the skill, which we expect to then trigger the playback of the next track in the queue.  

We also use the [BSTAlexa#on() listener](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html#on) - this allows us to listen for specific events occurring within the Alexa emulator. 
In this case, we want to confirm that the next track was queued correctly and has begun playing.

The events that can be listened for are listed [here](../api/classes/bstalexaevents.html).

## Going Even Further
Our sample project, [Bespoken Streamer](https://github.com/bespoken/streamer/), provides even more examples.

The [tests for it](https://github.com/bespoken/streamer/blob/master/test/streamerTest.js) are meant to exercise all the different actions
and states that the skill allows for. 

It gets quite involved, and the complexity really illustrates the need for such a tool: without it, manually working through each of these scenarios initially is daunting.

And ensuring all the scenarios still work when changes are made to the code is even more challenging. 

It's essential to have a unit-test tool such as this in one's toolbelt to avoid being plagued with quality issues.

## Parting Words
We are looking to continuously enhance the emulator. Right now, it supports:

* Standard Custom Skill behavior
* AudioPlayer behavior

It does **not** yet support:

* Error conditions ([Alexa requests based on improper Skill responses](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#systemexceptionencountered-request))
* [The PlaybackController interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference)

Please keep a lookout for support for both coming soon!

Additionally, [chat with us on Gitter](https://gitter.im/bespoken/bst) with any comments or questions.