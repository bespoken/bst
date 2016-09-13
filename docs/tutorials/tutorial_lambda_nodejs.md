
This tutorial shows you how to get started developing for Alexa Skills Kit using a Nodejs Lambda.  

## Prerequisites

* bespoken tools (bst)
    * `$ npm install bespoken-tools -g`
    * [Installation Instructions](/getting_started/)
* Amazon Developer Account
    * [Amazon Developer](https://developer.amazon.com/alexa)

## Getting Started

Clone the Amazon Alexa Skills Kit for JavaScript repo:  

```bash
$ git clone https://github.com/amzn/alexa-skills-kit-js
```

Go to the root level of the sample:
```bash
$ cd alexa-skills-kit-js/
```

## Start bst proxy

For Nodejs Lambdas, bst proxy command, in addition to setting up the proxy, will run your lambda for you and even reload it on changes.

This will start the helloWorld lambda:

```
$ bst proxy lambda samples/helloWorld/src/index.js
```

## Configure your Skill

From the [Alexa Skills Kit list](https://developer.amazon.com/edw/home.html#/skills/list) within the Amazon Developer's Console:

__Choose "Add a New Skill"__

__Fill out the Information tab__

* Give your skill a name and invocation phrase, 'bst nodejs sample' and 'greeter' for example

__Fill out the Interaction Model__

* Copy and paste the Intent Schema from [here](https://raw.githubusercontent.com/amzn/alexa-skills-kit-js/master/samples/helloWorld/speechAssets/IntentSchema.json)
* Copy and paste the Sample Utterances from [here](https://raw.githubusercontent.com/amzn/alexa-skills-kit-js/master/samples/helloWorld/speechAssets/SampleUtterances.txt)

__Configure the Endpoint__

When you started the proxy, bst printed out a URL that you need to configure your skill:

```bash
$ bst proxy lambda samples/helloWorld/src/index.js
BST: v0.6.5  Node: v4.3.2

Your URL for Alexa Skill configuration:
https://proxy.bespoken.tools?node-id=0c6a4f17-c86f-4024-ba26-a351ac319431
```
Alternatively, you can create this URL via the `proxy urlgen` command.

Copy and paste this URL as your endpoint:

![Alexa Skill Configuration](/assets/images/bst-nodejs-lambda-configuration.png "Alexa Skill Configuration")

Also make sure you select "HTTPS" and account linking to "NO".

__Configure SSL__  

On the SSL Certificate page, select the middle radio button "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority"

## Test
Go to the service simulator, and type: "hello" and hit "Ask \<Your Skill Name>".

You should get a valid JSON in reply:

![Test your Skill](/assets/images/bst-nodejs-lambda-test.png "Test your Skill")

## Next Steps
You can now start adding functionality to your skill. To learn more about coding Alexa Skills, see the official [documentation](https://github.com/amzn/alexa-skills-kit-js)

You can also try it out on an Alexa device like an Echo, as long as it is registered with your account.
Just say "Open \<Your Invocation Name>" to use it.
