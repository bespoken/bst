
## Overview

The intend command generates intent requests for your service as if they were coming from Alexa itself.

It works in a manner very similar to the Alexa simulator available via the Alexa developer console.  

To start using it, you will need to have your Interaction model, it could be written as a single file or separated as an Intent Schema and Sample Utterances.
By default, we have adopted the pattern used by the Alexa Skills Sample projects, we support the [Interaction model pattern](https://github.com/alexa/skill-sample-nodejs-fact) and also the [Intent Schema and Sample Utterances](https://github.com/alexa/skill-sample-nodejs-hello-world/) one.

That is, we look for the Interaction Model files inside a folder called models or speechAssets (if you're using the older style) located off the source root.

You can specify an alternative location via options to the command-line.

## Intending

To invoke the intend command, simply type:
```
$ bst intend <INTENT_NAME> [SlotName=SlotValue...]
```

For example:
```
$ bst intend HelloIntent SlotA=SlotValue
```

The intend command will return the full request and response of the interaction with your Skill service.  

By default, the system will:

* Use the Interaction Model in the models folder under the current working directory
* If there's no Interaction Model, it will use the Intent Model and Sample Utterances in the speechAssets folder under the current working directory
* Use the service currently running via the `bst proxy` command

If no service is currently running via bst proxy, and HTTP endpoint can be specified with the `--url` option:
```
$ bst intend HelloIntent --url https://my.skill.com/skill/path
```

## Interaction Model Format and Location
If your Interaction Model is not stored under ./models, or you have multiple locales, you can use an option to specify another location.

By default, we look for:

* `./models/en-US.json`

"Example With Alternative Locale:"

```
$ bst intend HelloIntent -m models/en-UK.json
```

These files are JSON, and typically defined by the ASK CLI tool from Amazon.

An example of these file can be found [here](https://github.com/alexa/skill-sample-nodejs-fact/blob/en-US/models/en-US.json).
