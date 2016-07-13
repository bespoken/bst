# Overview
The Bespoke Tools make it easy to develop for Alexa/Echo (and other products as they become available).

The current version supports a single command - debug.

Keep an eye out as we add more features and commands in the future. Current plans:  
-Deploy: automatically deploy Alexa lambdas to the cloud with a single command  
-Test: run phrases through and get the exact input sent to your Skill service

# Getting Started
Install NPM (if not already):
???

Install bespoke-tools:
`npm install bespoke-tools`

# Available Commands
Debug allows you to make changes to code on your machine and immediately test it with an Alexa device.

To use, it simply type in the following command:
`node client/main.js debug JPK bst.xappmedia.com 5000 9999`

# Contact
Email jpk@xappmedia.com with any questions or comments. We love to hear feedback.