
This tutorial shows you how to get started developing for Alexa Skills Kit using a Nodejs Lambda.  

## Prerequisites

* bespoken tools (bst)
    * `$ npm install bespoken-tools -g`
    * [Installation Instructions](/getting_started/)
* Google Cloud account
    * [Google Cloud]()
* API.ai account
    * [API.ai]()

## Getting Started

Clone the Amazon Alexa Skills Kit for JavaScript repo:  

```bash
$ git clone https://github.com/bespoken/super-simple-google-home
```

Go to the root level of the sample:
```bash
$ cd super-simple-google-home/
```

## Start bst proxy

For Google Cloud Functions, bst proxy command, in addition to setting up the proxy, will run your function for you and even reload it on changes.

This will start the function:

```
$ bst proxy function index.js
```

## Configure your API.ai Action



## Next Steps
You can now start adding functionality to your action. To learn more about working with Google Actions, see the official [documentation](https://github.com/amzn/alexa-skills-kit-js)

You can also try it out on a Google Home, as long as it is registered with your account.
Just say "Talk To \<Your Invocation Name>" to use it.
