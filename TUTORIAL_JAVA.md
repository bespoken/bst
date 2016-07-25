# Overview
This tutorial shows you how to get started developing for Alexa with Java and Maven.  

# Getting Started
__Clone the Bespoke Tools Project:__  
https://github.com/XappMedia/bst

__Setup the Bespoke Tools (instructions here):__  
https://github.com/XappMedia/bst/blob/master/README.md

__Install Maven__  
https://maven.apache.org/install.html

__Run the Sample Java Skill__  
Go to the samples/java directory under the Bespoke Tools project.  
Compile it with this command:  
`mvn compile`  

Run it with this command:  
`mvn exec:java -Dexec.executable="java" -DdisableRequestSignatureCheck=true -Dexec.args=$@`

The service will listen on port 9999 by default.

__Startup the bst proxy__  
`bst proxy http <YOUR_ID> 9999`

__Sign up for Amazon Developer account (if you have not already):__  
https://developer.amazon.com/appsandservices  
Click on the Sign In or Create Account link on the top-right

# Configure your skill
__Select the Alexa tab__  
__Choose Get Started__  
__Choose Add a New Skill__  
__Fill out the Information tab (give a name and invocation phrase)__  
__Fill out the Interaction Model__  
Copy the Intent Schema from here:  
https://github.com/XappMedia/bst/blob/master/samples/java/src/main/java/helloworld/speechAssets/IntentSchema.json

Copy the Utterances from here:  
https://github.com/XappMedia/bst/blob/master/samples/java/src/main/java/helloworld/speechAssets/SampleUtterances.txt

__Configure the Endpoint:__  
The endpoint should be set to:  
https://bst.xappmedia.com/hello?node-id=@YOUR_NODE@

For example, if my node-id is JPK, it should be:  
https://bst.xappmedia.com/hello?node-id=JPK

Set account linking to "No"

__Configure SSL__  
Select "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority"

__Test!__  
Go to the service simulator, and type: "Hello"  
Hit "Ask Test"  
You should get a valid JSON in reply  

# Next Steps
You can now start adding functionality to your skill. To learn more about coding Alexa skills, look here:  
https://github.com/amzn/alexa-skills-kit-java

You can also try it out on an Alexa device like an Echo, as long as it is registered with your account.
Just say "Open @Invocation Name@" to use it.
