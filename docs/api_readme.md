Bespoken Tools Reference API
============================
# Overview
We currently only expose four primary classes:
- [BSTAlexa](classes/bstalexa.html)
- [BSTEncode](classes/bstencode.html)
- [LambdaServer](classes/lambdaserver.html)
- [Logless](classes/logless.html)

We make them available to:  
* Facilitate testing of Skills using our emulator.  
* Use our Logless client for debugging and diagnostics.  

[BSTAlexa](classes/bstalexa.html) is our Alexa emulator. It allows one to write unit tests and functional tests that mimic the functionality of the Alexa service.

The [LambdaServer](classes/lambdaserver.html) makes it easy to run your Lambdas locally for unit and functional tests.

[BSTEncode](classes/bstencode.html) encodes audio files to [Alexa standards](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference) and makes them available via S3.

[Logless](classes/logless.html) makes logging and diagnostics for Alexa skills and Lambdas super-simple.

# Example Unit Test  
Below is a simple example Mocha test. 

This can be used to test any Alexa skill, not just one written in JavaScript:

```
it('Plays and Goes To Next', function (done) {

    alexa.spoken('Play Music', function(error, response) {
        // Confirms the correct directive is returned when the Intent is spoken
        assert.equal(response.response.directives[0].type, 'AudioPlayer.Play');
        
        // Ensures the track with correct token is returned
        assert.equal(response.response.directives[0].audioItem.stream.token, '1');

        alexa.intended('AMAZON.NextIntent', null, function (error, response) {
            // Ensures the track with next token is returned    
            assert.equal(response.response.directives[0].audioItem.stream.token, '2');
            done();
        });
    });
});
```

We initialize the [BSTAlexa](classes/bstalexa.html) in the beforeEach block, like so:

```
let alexa = null;
beforeEach(function (done) {
    alexa = new bst.BSTAlexa('http://localhost:10000',
                             './speechAssets/IntentSchema.json',
                             './speechAssets/Utterances.txt');
    alexa.initialize(function () {
        done();
    });
});
```

And we cleanup:

```
afterEach(function (done) {
    alexa.shutdown(function () {
        done();
    });
});
```

# Using the LambdaServer
We can the utilize the [LambdaServer](classes/lambdaserver.html) to automatically start and stop a NodeJS/Lambda-based skill
within our test.

To do this, simply start the [LambdaServer](classes/lambdaserver.html) on an open port and point it at your Lambda file:

```
let server = new bst.LambdaServer('./lib/index.js', 10000, true);
server.start();
```

The last parameter, true, enables verbose debugging. This prints out all the requests and responses from the skill to the console.

This will typically reside within our beforeEach block, similar to the the [BSTAlexa](classes/bstalexa.html) initialization:

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
```

And we shut it down at the end like so:

```
afterEach(function(done) {
    alexa.stop(function () {
        server.stop(function () {
            done();
        });
    });
});
```

**It is very important to shutdown the server - otherwise it will go on listening on the port specified!**

# Testing Events
Listeners can be set on all the events listed [here](classes/bstalexaevents.html).

For example, to see that a track has begun playing, 
add a listener on the [AudioPlayer.PlaybackStarted](classes/bstalexaevents.html#audioplayerplaybackstarted) event.

This works well in concert with the [audioItemFinished](classes/bstalexa.html#audioitemfinished) call.  
This call acts as if the current track had finished playing on the device.  
The next audio item queued from your skill should then be started.

Sample code:
```
alexa.on('AudioPlayer.PlaybackStarted', function(audioItem) {
    assert.equal(audioItem.stream.token, '2');
});

alexa.audioItemFinished();
```