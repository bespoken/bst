# Overview
The Bespoke Tools make it easy to develop for Alexa/Echo (and other products as they become available).

The current version supports a single command - debug.

Keep an eye out as we add more features and commands in the future. Current plans:  
-Deploy: automatically deploy Alexa lambdas to the cloud with a single command  
-Test: run phrases through and get the exact input sent to your Skill service

# Getting Started
Install NPM (if not already):  
http://blog.npmjs.org/post/85484771375/how-to-install-npm

Install bespoke-tools:  
`npm install bespoke-tools -g`

# Available Commands
## Debug
**Running Debug**
Debug allows you to make changes to code on your machine and immediately test it with an Alexa device.

To use, it simply type in the following command:
`bst debug <SERVICE_NAME> <PORT>`

For example:
`bst debug JPK 9999`

The value service name value, "JPK", is the name for your service. It uniquely identifies it to our server.
We use this so we know which callbacks from Alexa to forward to your client.

The second parameter, port, represents the port that your local Alexa service is listening on.

Set this to whatever port your local server is running on. All traffic coming from Alexa will be forwarded to it.

**Configuring Your Skill**
Your skill must be setup to point at our server. For example, if the URL for your skill is normally:
https://myskill.example.com/skillA

It should instead be configured to point at our server, like so:
https://bst.xappmedia.com/skillA?node-id=JPK

_Also note that that service name set with the debug command must be passed in the query string__
Here is it set as ?node-id=JPK

The rest of the URL path and query string should be unchanged.

You can enter the command for help transforming your URL:
`bst debug-url <SERVICE_NAME> <URL>`

This value should be entered as the endpoint on the Configuration section for your Alexa skill:

# Contact
Email jpk@xappmedia.com with any questions or comments. We love to hear feedback.