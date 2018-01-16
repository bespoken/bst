This tutorial shows you how to get started using our Virtual Alexa emulator with Node.js and Javascript.

*Please note - our Virtual Alexa project has replaced the BSTAlexa classes.*  
They are still available, and [you can read about them here](tutorial_bst_emulator_nodejs) but will be deprecated in a future version.

The purpose of the emulator is to enable unit-testing and functional-testing of Alexa skills,
allowing one to:

* Emulate the complex behavior of the Alexa service, without an Alexa device or any manual interaction
* Ensure ongoing skill quality by embedding tests in Continuous Integration/Deployment processes

*And please note - though this example is written in Javascript, the emulator can be used to test non-Javascript-based skills!*

## Tutorial Prerequisites

* Mocha Test Framework
    * https://mochajs.org/#getting-started
    * `$ npm install mocha --save-dev`
* A Node.js, Lambda-based Alexa skill 
    * If you do not have one and want to follow along at home, [try ours here](https://github.com/bespoken/GuessThePrice).
    * The test used in this tutorial is [found here](https://github.com/bespoken/GuessThePrice/blob/master/test/index-test.js).
* Virtual Alexa added to your project's package.json
    * `$ npm install virtual-alexa --save-dev`
    * For this example, we make it a "dev" dependency as we will be using it only for testing.

## Test Structure

We are using Mocha for tests, and Chai for assertions.

There are lots of other fine testing frameworks out there - for an example that uses Jest, [look here](https://github.com/bespoken/giftionary/blob/master/test/index.test.js).

## Adding the Virtual Alexa module
At the top of your test, include:
```
const vax = require("virtual-alexa");
```

## First Simple Test

```javascript
it('Launches successfully', function (done) {
    const alexa = vax.VirtualAlexa.Builder()
        .handler("index.handler") // Lambda function file and name
        .intentSchemaFile("./speechAssets/IntentSchema.json")
        .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
        .create();

    let reply = await alexa.launch();
    assert.include(reply.response.outputSpeech.ssml, "Welcome to guess the price");
});
```

This test runs through some simple behavior:

* It emulates the Skill being launched
* It confirms the Skill returns the correct outputSpeech after being launched

The goal is to test until we feel confident in the behavior of our skill, and that it is correctly handling the interaction with the Alexa Service.

It is a straightforward exercise to add more property checks on the payload to further confirm behavior.

## A More Complex Test

```javascript
describe("One player", () => {
    it("Flow works", async function () {
        const alexa = vax.VirtualAlexa.Builder()
            .handler("index.handler") // Lambda function file and name
            .intentSchemaFile("./speechAssets/IntentSchema.json")
            .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
            .create();

        const launchResponse = await alexa.launch();
        assert.include(launchResponse.response.outputSpeech.ssml, "Welcome to guess the price");

        const singlePlayerResponse = await alexa.utter("1");
        assert.include(singlePlayerResponse.response.outputSpeech.ssml, "tell us your name");

        const firstProductQuestion = await alexa.utter("juan");
        assert.include(firstProductQuestion.response.outputSpeech.ssml, "Guess the price");

        const secondProductQuestion = await alexa.utter("200 dollars");
        assert.include(secondProductQuestion.response.outputSpeech.ssml, "the actual price was");
        assert.include(secondProductQuestion.response.outputSpeech.ssml, "Guess the price");

        const thirdProductQuestion = await alexa.utter("200 dollars");
        assert.include(thirdProductQuestion.response.outputSpeech.ssml, "the actual price was");
        assert.include(thirdProductQuestion.response.outputSpeech.ssml, "Guess the price");

        const gameEndQuestion = await alexa.utter("200 dollars");
        assert.include(gameEndQuestion.response.outputSpeech.ssml, "Game ended, your final score was");
    });
});
```

This test runs through an entire interaction with the user.

We start with launch, and then work our way through a series of utterances. With each step, we ensure the proper response is received.

Additional tests can be constructed on any part of the payload - cards, video directives, etc.

## Going Even Further
We also support testing the AudioPlayer. You can see an [example with our Super Simple Audio Player](https://github.com/bespoken/super-simple-audio-player/blob/Part3/README.md).

And here is an example that [uses the Jest testing framework](https://github.com/bespoken/giftionary/blob/master/test/index.test.js).

Lastly, to see how this is tied into a Continuous Integration/Continuous Delivery process, [read our blog post here](https://bespoken.io/blog/alexa-skill-automation-testing-integration-delivery/).

## Parting Words
We are looking to continuously enhance the emulator. Right now, it supports:

* Standard Custom Skill behavior
* AudioPlayer behavior

It does **not** yet support:

* Error conditions ([Alexa requests based on improper Skill responses](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#systemexceptionencountered-request))
* [The PlaybackController interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference)

Please keep a lookout for support for both coming soon!

Additionally, [chat with us on Gitter](https://gitter.im/bespoken/bst) with any comments or questions.