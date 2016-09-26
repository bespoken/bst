This tutorial shows you how to get started using our BST Alexa emulator with Node and Javascript.  

The purpose of the emulator is to allow unit- and functional-testing of Alexa Skills, 
allowing one to:
* Emulate the complex behavior of the Alexa service, without an Alexa device or any manual interaction
* Ensure ongoing skill quality by embedding tests in Continuous Integration/Deployment processes

*And please note - though this example is written in Javascript, the emulator can be used to test non-Javascript-based skills!*

Additionally, though this example focuses on the AudioPlayer interface, 
the BSTAlexa emulator can be used for testing regular Alexa skills as well.

## Prerequisites

**A Node.js, Lambda-based Alexa skill**  
If you do not have one and want to follow along at home, [try ours here](https://github.com/bespoken/skill-sample-nodejs-audio-player),
derived from excellent streaming skill example provided by Amazon.

To get started with it, [follow the README](https://github.com/bespoken/skill-sample-nodejs-audio-player/blob/mainline/README.md).

The tests used in this tutorial are [found here](https://github.com/bespoken/skill-sample-nodejs-audio-player/test/index-test.js).

**Bespoken Tools added to your project's package.json**
```
$ npm install bespoken-tools --save-dev
```

For this example, we make it a "dev" dependency as we will be using it only for testing.

## Test Structure

We are using Mocha for tests. We breakdown our tests into three parts:
* beforeEach - Creates a local Lambda server and initializes the emulator
* tests - Performs the actual tests by issuing intents and emulating AudioPlayer behavior
* afterEach - Tears down the local Lambda server and shuts down the emulator

These our standard testing considerations, *though we emphasize the importance of stopping the Lambda server.*
If this is not done, it will continue listening on the assigned port, potentially causing conflicts and errors.

## Adding the bst module
At the top of your test, include:
```
var bst = require('bespoken-tools');
```

Easy!

## Setup and Teardown

```
beforeEach(function (done) {
    server = new bst.LambdaServer('./lib/index.js', 10000, true);
    alexa = new bst.BSTAlexa('http://localhost:10000',
                             './speechAssets/IntentSchema.json',
                             './speechAssets/Utterances.txt');
    server.start(function() {
        alexa.start(function () {
            done();
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

The BST Alexa start then takes the URL of the Lambda server as its first parameter (it begins listening).  
*Note that if you are not using Lambdas but a "Plain Old HTTP Service" you can skip the server start call and just point it at a server here.*

Additionally, it takes the location of the Intent Schema and Utterances in the second and third parameters.  
These are not required and will default to 'speechAssets/IntentSchema.json' and 'speechAssets/SampleUtterances.txt' respectively.

The afterEach block ensures the LambdaServer and BSTAlexa emulator are shutdown correctly.

## First Simple Test

```
it('Plays First Podcast and Then Goes To Next', function (done) {

    alexa.spoken('Play The Podcast', function(error, payload) {
        // Confirms the correct directive is returned when the Intent is spoken
        assert.equal(payload.response.directives[0].type, 'AudioPlayer.Play');
        
        // Ensures the track with correct token is returned
        assert.equal(payload.response.directives[0].audioItem.stream.token, '1');

        alexa.intended('AMAZON.NextIntent', null, function (error, payload) {
            // Ensures the track with next token is returned    
            assert.equal(payload.response.directives[0].type, 'AudioPlayer.Play');
            assert.equal(payload.response.directives[0].playBehavior, 'REPLACE_ALL');
            assert.equal(payload.response.directives[0].audioItem.stream.token, '2');
            done();
        });
    });
});
```

This test runs through some simple behavior:
* It emulates 'Play The Podcast' being spoken
* It confirms the Skill returns the correct directive based on this utterance (AudioPlayer.Play)
* It confirms the correct token is return by the skill
* It issues a second intent, the builtin Amazon.NextIntent
* It confirms the response from the Skill is correct based on the NextIntent

The goal is to test until we feel confident in the behavior of our skill, and that it is handling correctly the interaction with Alexa Service.

It is a straightforward exercise to add more property checks on the payload to further confirm behavior.

## A Slightly More Complex Test

```
it('Plays The First Podcast To Completion And Goes To Next', function (done) {

    alexa.spoken('Play The Podcast', function(error, payload) {
        alexa.on('AudioPlayer.PlaybackStarted', function(audioItem) {
            assert.equal(audioItem.stream.token, '2');
            done();
        });

        alexa.audioItemFinished();
    });
});
```

This test uses the [BSTAlexa#audioItemFinished() call](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html#audioitemfinished) 
to emulate the audio playing to completion on the device.  

The Alexa service will send an 'AudioPlayer.PlaybackFinished' request to the skill, which we expect to trigger the playback the next track in the queue.  

We also use [BSTAlexa#on() listener](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html#on) - this allows us to listen for specific events occurring within the Alexa emulator. 

The events that can be listened for are listed [here](../api/classes/bstalexaevents.html). These events are intended to directly correspond to what happens with the internal state of the real Alexa service.

## Parting Words
We are looking to continuously enhance the emulator. Right now, it supports:

* Standard Custom Skill behavior
* AudioPlayer behavior

It does **not** yet support:

* Error conditions ([Alexa requests based on improper Skill responses](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#systemexceptionencountered-request))
* [The PlaybackController interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference)

Please keep a lookout for support for both coming soon!

Additionally, [chat with us on Gitter](https://gitter.im/bespoken/bst) with any comments or questions