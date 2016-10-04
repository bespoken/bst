
## Overview

The intend command generates intent requests for your service as if they were coming from Alexa itself.

It works in a manner very similar to the Alexa simulator available via the Alexa developer console.  

To start using it, you will need a local file that contains your Intent Schema and Sample Utterances.  
By default, we have adopted the pattern used by the Alexa Skills Sample projects (see [here](https://github.com/amzn/alexa-skills-kit-js/tree/master/samples/helloWorld)).

That is, we look for the Interaction Model files inside a folder called speechAssets located off the source root.  

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

* Use the Intent Model and Sample Utterances in the speechAssets folder under the current working directory
* Use the service currently running via the `bst proxy` command

If no service is currently running via bst proxy, and HTTP endpoint can be specified with the `--url` option:
```
$ bst intend HelloIntent --url https://my.skill.com/skill/path
```

## Speech Asset Format and Location
If your speech assets  (Intent Model and Sample Utterances) are not stored under ./speechAssets, you can use an option to specify another location.

By default, we look for:

* `./speechAssets/IntentSchema.json`
* `./speechAssets/SampleUtterances.txt`

Example:
```
$ bst intend HelloIntent -i interactions/IntentSchema.json -s interactions/SampleUtterances.txt
```

The format of these files is the same as they are entered in the Alexa Skill configuration.  

The Intent Schema is a JSON file. Samples utterances is a space-delimited text file.

An example of these files can be found [here](https://github.com/amzn/alexa-skills-kit-js/tree/master/samples/helloWorld/speechAssets).