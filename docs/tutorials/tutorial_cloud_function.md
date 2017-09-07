
This tutorial shows you how to get started developing for Actions on Google using a Google Cloud Function with Bespoken.

## Prerequisites

* Bespoken command-line tools (bst)
    * `$ npm install bespoken-tools -g`
    * [Installation Instructions](/getting_started/)
* Google Cloud account
    * [Google Cloud](https://console.cloud.google.com/)
* API.AI account
    * [API.AI](https://api.ai/)

## Getting Started

Clone the Super Simple Google Action repo:

```bash
$ git clone https://github.com/bespoken/super-simple-google-action
```

Go to the root level of the sample:
```bash
$ cd super-simple-google-action/
```

Install the dependencies:
```bash
$ npm install
```

## Configure your API.AI Action
For a detailed walkthrough on setting up an Action on Google with API.AI, go [here](tutorial_configuring_api_ai).

## Start bst proxy

For Google Cloud Functions, the `bst proxy` command, in addition to setting up the proxy, will run your function for you and even reload it on changes.

This will start the function:

```
$ bst proxy function index.js simpleFunction
```

## Try it out
You can test things out right inside API.AI - just enter "Hello" into the "Try it now" field on the top-right.

You should see the request and response come across the console where the `bst proxy` is running, like so:  
<img src='../../assets/images/api-ai-try-it-bst.png' />

Or you can try it in the [Actions on Google Web Simulator](https://developers.google.com/actions/tools/web-simulator).

## Hooking into the Bespoken Dashboard
To use our monitoring and logging facility, [sign up here](https://apps.bespoken.io/dashboard).

Once you have signed in, create a new source by clicking on the "+" button at the bottom or link at the top:
<img src='../../assets/images/dashboard-source-adding.png' />

Name your source and then hit "Create Source". On the following page, select "Next: Check For Logs".

On the right-hand side of the page, select "Show" over the Secret Key:
<img src='../../assets/images/dashboard-secretkey.png' style='height: 60px !important' />

Cut and paste the secret key into the index.js file in Super Simple Google Action project:
<script src="https://gist.github.com/jkelvie/6bd2f5c7eb11fd6307fa538b0f918557.js"></script>

The line is at the bottom of the file.

If you are using a Cloud Function for Firebase (as opposed to a "plain" Google Cloud Function), it will have a slightly different signature, like this:
<script src="https://gist.github.com/jkelvie/cb6bffc4753456b2d5cd152fc5391efd.js"></script>

Now, the summary and log data for your action will be available in the Dashboard, both while using the proxy for development and once you go live!
<img src='../../assets/images/dashboard-logs-actions.png' />

## Next Steps
You can now start adding functionality to your action. To learn more about working with Actions on Google, see the official [documentation](https://developers.google.com/actions/)

You can also try it out on a Google Home or [Google Assistant-enabled phone](https://assistant.google.com), as long as it is registered with your account.
Just say "Talk To {Your Invocation Name}" to use it.
