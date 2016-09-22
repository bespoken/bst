This tutorial shows you how to get started developing with bst for Alexa Skills Kit in Python using [Flask-Ask](https://alexatutorial.com/flask-ask/).

## Prerequisites

* bespoken tools (bst)
    * `$ npm install bespoken-tools -g`
    * [Installation Instructions](/getting_started/)
* Amazon Developer Account
    * [Amazon Developer](https://developer.amazon.com/alexa)
* Flask-Ask
    * `$ pip install flask-ask`

## Getting Started

We will use the tidepooler sample John [provides](https://github.com/johnwheeler/flask-ask/tree/master/samples/tidepooler) in the Flask-Ask repo..

Clone the repo:
```
$ git clone https://github.com/johnwheeler/flask-ask.git
```
And jump to the root of the tidepooler sample:

```
$ cd flask-ask/samples/tidepooler/
```

and start the local server for the skill:

```
$ python tidepooler.py
```

The tidepooler skill is now running on your local machine, listening on port 5000.

## Start bst proxy

Open a new terminal and start the bst proxy:

```
$ bst proxy http 5000
```

where `http` is the protocol for the proxy and `5000` is the port the tidepooler skill server is listening on.

## Configure your Skill

From the [Alexa Skills Kit list](https://developer.amazon.com/edw/home.html#/skills/list) within the Amazon Developer's Console:

__Choose "Add a New Skill"__

__Fill out the Information tab__

*  Give your skill a name and invocation phrase, "tidepooler" and "tidepooler" for example

__Fill out the Interaction Model__

* Copy and paste the Intent Schema from [here](https://raw.githubusercontent.com/johnwheeler/flask-ask/master/samples/tidepooler/speech_assets/IntentSchema.json)
* Click "Add Slot Type", enter `LIST_OF_CITIES` as the type and copy and paste the values from [here](https://raw.githubusercontent.com/johnwheeler/flask-ask/master/samples/tidepooler/speech_assets/customSlotTypes/LIST_OF_CITIES), click `Save`
* Click "Add Slot Type", enter `LIST_OF_STATES` as the type and copy and paste the values from [here](https://raw.githubusercontent.com/johnwheeler/flask-ask/master/samples/tidepooler/speech_assets/customSlotTypes/LIST_OF_STATES), click `Save`
* Copy and paste the Sample Utterances from [here](https://raw.githubusercontent.com/johnwheeler/flask-ask/master/samples/tidepooler/speech_assets/SampleUtterances.txt)

__Configure the Endpoint__

When you started the proxy, bst printed out a URL that you need to configure your skill:

```bash
$ bst proxy http 5000
BST: v0.6.14  Node: v4.3.2

Your URL for Alexa Skill configuration:
https://proxy.bespoken.tools/YOUR/SKILL/PATH?node-id=d34ca5f3-f55e-4e07-9d1e-4fcf918433b5
(Be sure to put in your real path and other query string parameters!)

INFO  2016-09-12T17:34:52.202Z Connected - proxy.bespoken.tools:5000
```

Since tidepooler.py does not have a path it is listening on, simply `/`, you can remove the `YOUR/SKILL/PATH` from the provided URL and copy and paste as your endpoint:

```
https://proxy.bespoken.tools/?node-id=d34ca5f3-f55e-4e07-9d1e-4fcf918433b5
```

Also make sure you select "HTTPS" for the endpoint type and account linking is set to "NO".

__Configure SSL__  

On the SSL Certificate page, select the middle radio button "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority"

## Test

Now that you have the python server running, bst proxy running and your skill configured, it is time to test.  In the Service Simulator on the Test tab, try typing in some of the following phrases:

```
get high tide
```
```
when is the next highest water for virginia beach
```
```
what cities are supported
```

We can also use the bst speak command to test locally instead of using the Service Simulator.  In order to do this, you need to tell Flask-Ask to not verify the request signatures (which it does by default).

After [line 55](https://github.com/johnwheeler/flask-ask/blob/master/samples/tidepooler/tidepooler.py#L55) of tidepooler.py, insert the following line:

```python
app.config['ASK_VERIFY_REQUESTS'] = False
```

__Please Note:__  As mentioned in the [documentation](https://alexatutorial.com/flask-ask/configuration.html), this should be disabled for production.  

Restart your python skill server and from a new terminal (make sure bst proxy is still running) at the root of the project run:

```
$ bst speak -i speech_assets/IntentSchema.json -s speech_assets/SampleUtterances.txt get high tide
```

You should see the request and then the response back from tidepooler.py.

You can even test with slots by including your slot value in brackets, for example:

```
$ bst speak -i speech_assets/IntentSchema.json -s speech_assets/SampleUtterances.txt when is the next highest water for {virginia beach}
```

## Other Resources

- [bst proxy](/commands/proxy/)
- [bst speak](/commands/speak/)
- [Flask-Ask Documentation](https://alexatutorial.com/flask-ask/)
- [Flask-Ask on Github](https://github.com/johnwheeler/flask-ask)
- [Flask-Ask: A New Python Framework for Rapid Alexa Skills Kit Development](https://developer.amazon.com/public/community/post/Tx14R0IYYGH3SKT/Flask-Ask-A-New-Python-Framework-for-Rapid-Alexa-Skills-Kit-Development)
