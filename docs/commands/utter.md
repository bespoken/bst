
## Overview

The utter command takes an utterance ("play next song") and turns into a JSON payload, imitating as if it was coming from Alexa itself.

It works in a manner very similar to the Alexa simulator available via the Alexa developer console.  

To start using it, you will need to have your Interaction model, it could be written as a single file or separated as an Intent Schema and Sample Utterances.
By default, we have adopted the pattern used by the Alexa Skills Sample projects, we support the [Interaction model pattern](https://github.com/alexa/skill-sample-nodejs-fact) and also the [Intent Schema and Sample Utterances](https://github.com/alexa/skill-sample-nodejs-hello-world/) one.

That is, we look for the Interaction Model files inside a folder called models or speechAssets (if you're using the older style) located off the source root.

You can specify an alternative location via options to the command-line.

## Uttering

To invoke the utter command, simply type:
```
$ bst utter <UTTERANCE>
```

For example:
```
$ bst utter Hello World
```

The utter command will return the full request and response of the interaction with your Skill service.

By default, the system will:

* Use the Interaction Model in the models folder under the current working directory
* If there's no Interaction Model, it will use the Intent Model and Sample Utterances in the speechAssets folder under the current working directory
* Use the service currently running via the `bst proxy` command

If no service is currently running via bst proxy, and HTTP endpoint can be specified with the `--url` option:
```
$ bst utter Hello World --url https://my.skill.com/skill/path
```

## Interaction Model Format and Location
If your Interaction Model is not stored under ./models, or you have multiple locales, you can use an option to specify another location.

By default, we look for:

* `./models/en-US.json`

"Example With Alternative Locale:"
```
$ bst utter Hello World -m models/en-UK.json
```

These files are JSON, and typically defined by the ASK CLI tool from Amazon.

An example of these file can be found [here](https://github.com/alexa/skill-sample-nodejs-fact/blob/en-US/models/en-US.json).

## Working With Slots

Slot handling is automatic - we check for defined slots and samples and extract them. To send an utterance that uses slots, just write it as you would say it.

For example, if the sample utterance was defined as:
```
HelloWorld Hello world, my name is {Name}
```

Then the utter command would be:
```
$ bst utter Hello World, my name is John
```

The value `John` will then be automatically placed in the Name slot for the utterance on the request.

## Other Notes

**Default Utterances**  

We currently use a simple algorithm to pick out a default Intent if none of the sample utterances match the supplied utterance.  

This algorithm is - the first utterance of the first intent defined in the sample file.  

This is meant to loosely mimic the behavior of the Alexa Simulator, which also seems to randomly select an intent/utterance when none matches.
