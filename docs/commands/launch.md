
## Overview
The launch command send a launch request to your service as if it was comming from alexa itself.

To start using it, you will need to support the "LaunchRequest" event on your handler for the received Intents in your service.

## Usage

To invoke the launch command, simply type:
```
$ bst launch
```

The launch command will return the full request and response of the interaction with your Skill service.

By default, the system will use the service currently running via the `bst proxy` command

## Working without using the proxy

If no service is currently running via bst proxy, and HTTP endpoint can be specified with the `--url` option:
```
$ bst launch --url https://my.skill.com/skill/path
```

