This tutorial will help you get setup using API.AI with our sample project and Bespoken.

Ping us on [gitter](https://gitter.im/bespoken/bst) if you have any question.

This tutorial goes great with our [Bespoken for Cloud Functions tutorial](/tutorials/tutorial_cloud_function) :-)

# Pre-Requisites
This tutorial assumes you have cloned the [Super Simple Google Action repository](https://github.com/bespoken/super-simple-google-action).

If you have not already, do it with this command:
```
git clone https://github.com/bespoken/super-simple-google-action
```

# Walk-through
## Register/login to API.AI account
Go to the [API.AI website](https://api.ai):

<img src='../../assets/images/api-ai-register.png' />

Sign-in or create your account.

## Create a new agent
<img src='../../assets/images/api-ai-create-agent.png' />

Click on the "Create Agent" button.

## Name the agent
<img src='../../assets/images/api-ai-agent-name.png' />

Give the agent a name, then click "Save".

After clicking save, click the "Export and Import" tab.

## Restore sample action
Select "Restore From Zip":  
<img src='../../assets/images/api-ai-restore.png' />

Click "Select File".

Browse to the directory where you cloned the [Super Simple Google Action repository](https://github.com/bespoken/super-simple-google-action):  
<img src='../../assets/images/api-ai-restore-file.png' />

Choose "SuperSimpleGoogleAction.zip" from the file picker and click "Open".

If you the click on "Intents" on the left-hand side menu, you should now see the following:  
<img src='../../assets/images/api-ai-intents.png' />

Those intents will be available if the agent was properly restored.

## Enable Webhook Fulfillment
Click on Fulfillment from the left-hand menu.

Toggle "Enabled" so that Webhook fulfillment is enabled:  
<img src='../../assets/images/api-ai-fulfillment.png' />

This will cause the configured Intents to call out the specified URL for handling user requests.

The URL should be your `bst proxy` endpoint. To find it, just type at the command-line:
```
bst proxy function index.js simpleFunction
```

Grab the URL from the console output, which should look like this:  
<img src='../../assets/images/api-ai-bst-proxy.png' />

After entering this, click "Save" at the top.

## Enable Actions on Google integration
Select the "Integrations" tab on the left.

<img src='../../assets/images/api-ai-integrations.png' />

Enable the first option, "Actions on Google".

<img src='../../assets/images/api-ai-integration-details.png' />

Enter the "World" for the "Invocation Name". If you have a Google Cloud Project setup, enter the ID on this screen - [you can find the project ID here](https://console.cloud.google.com).

If you want to use this Action on your Google Home device, [Google Assistant-enabled phone](https://assistant.google.com) or in the [Web Simulator]((https://developers.google.com/actions/tools/web-simulator)), click "Preview".

# Next Steps
To use this API.AI-based Action, follow our [tutorial here](tutorial_cloud_function).
