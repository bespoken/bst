This tutorial shows you how to get started developing for Alexa with Java and Maven.  

## Prerequisites

* bespoken tools (bst)
    * `$ npm install bespoken-tools -g`
    * [Installation Instructions](/getting_started)
* maven
    * OSX with homebrew: `$ brew install maven`
    * [Installation Instructions](https://maven.apache.org/install.html)
* Amazon Developer Account
    * [Amazon Developer](https://developer.amazon.com/alexa)

## Getting Started

Clone the bst project:
```bash
$ git clone https://github.com/bespoken/bst
```

Go to the sample java skill
```bash
$ cd bst/samples/java
```

## Run the Sample Java Skill

From within bst/samples/java directory, compile the example with this command:  
```bash
$ mvn compile
```

Run the server with this command:  
```bash
$ mvn exec:java -Dexec.executable="java" -DdisableRequestSignatureCheck=true -Dexec.args=$@
```

The service will listen on port 9999 by default.

## Start bst proxy

Open a new terminal and start the proxy for port 9999:

```bash
$ bst proxy http 9999
```

## Configure your Skill

From the [Alexa Skills Kit list](https://developer.amazon.com/edw/home.html#/skills/list) within the Amazon Developer's Console:

__Choose "Add a New Skill"__

__Fill out the Information tab__

* Give your skill a name and invocation phrase, 'bst java sample' and 'greeter' for example

__Fill out the Interaction Model__

* Copy and paste the Intent Schema from [here](https://raw.githubusercontent.com/bespoken/bst/master/samples/java/src/main/java/helloworld/speechAssets/IntentSchema.json)
* Copy and paste the Sample Utterances from [here](https://raw.githubusercontent.com/bespoken/bst/master/samples/java/src/main/java/helloworld/speechAssets/SampleUtterances.txt)

__Configure the Endpoint__

When you started the proxy, bst printed out a URL that you need to configure your skill:

```bash
$ bst proxy http 9999
BST: v0.6.5  Node: v4.3.2

Your URL for Alexa Skill configuration:
https://proxy.bespoken.tools/YOUR/SKILL/PATH?node-id=0c6a4f17-c86f-4024-ba26-a351ac319431
(Be sure to put in your real path and other query string parameters!)

```
Alternatively, you can create this URL via the `proxy urlgen` command.

You first need to modify it to the path that your server is listening on, in this case it is `/hello`.

```
https://proxy.bespoken.tools/hello?node-id=0c6a4f17-c86f-4024-ba26-a351ac319431
```

Copy and paste this URL as your endpoint:

![Alexa Skill Configuration](/assets/images/bst-java-server-tutorial-configuration.png "Alexa Skill Configuration")

Also make sure you select "HTTPS" and account linking to "NO".

__Configure SSL__  

On the SSL Certificate page, select the middle radio button "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority"

## Test
Go to the service simulator, and type: "hello" and hit "Ask \<Your Skill Name>".

You should get a valid JSON in reply:

![Test your Skill](/assets/images/bst-java-server-tutorial-test.png "Test your Skill")

## Next Steps
You can now start adding functionality to your skill. To learn more about coding Alexa Skills, see the official [documentation](https://github.com/amzn/alexa-skills-kit-java)

You can also try it out on an Alexa device like an Echo, as long as it is registered with your account.
Just say "Open \<Your Invocation Name>" to use it.
