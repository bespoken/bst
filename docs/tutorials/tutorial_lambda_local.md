
This tutorial shows you how to use Bespoken to test AWS Lambdas locally.

Using this, you can send HTTP requests directly to and from your AWS Lambda (Node.js or Python) on your laptop.

## Prerequisites
For Node.js - Install bst:

* `$ npm install bespoken-tools -g`
* [Full Installation Instructions](/getting_started/)

For Python - Install bstpy:

* `git clone the bstpy repo`
* `cd bstpy`
* `pip install -e bstpy`
* [Full Installation Instructions](https://github.com/bespoken/bstpy/blob/master/README.md)

## Creating The HTTP Service
These examples are based on our own sample project (which in turn is based on Amazon's HelloWorld Lambda examples). If  you want to use our sample project, just clone this repo:
```
git clone https://github.com/bespoken/lambda_samples
```

Change directories to the cloned project:
```
cd lambda_samples
```

Of course, feel free to use your own existing Lambda project.

**Exposing the Node.js Lambda as an HTTP service**  
Run the `bst proxy lambda` command to do this:
```
bst proxy lambda HelloWorld.js --verbose
```
The --verbose option will cause additional useful information to be printed to the console.

**Exposing the Python Lambda as an HTTP service**  
Run the `bstpy` command to do this:
```
bstpy HelloWorld.handler
```

In both cases, the Lambda will be exposed as an HTTP service at http://localhost:10000.

## Testing The HTTP Service
Using curl (from another terminal window, or from the same terminal by running `bst` or `bstpy` in the background):
```
curl -H "Content-Type: application/json" \
  -X POST \
  -d '{"key1":"value1","key2":"value2", "key3": "value3"}' \
  http://localhost:10000
```

And the output:

<img src='../../assets/images/bst-lambda-local-curl.png' />

The actual output from the Lambda is highlighted in red.

Obviously, much more complex Lambdas and responses are possible. With this complexity, being able to test them locally like this only becomes more vital.

*Note* - we recommend using Postman for these sort of manual tests - it provides essentially a nice UI for curl:
[Get Postman](https://www.getpostman.com/apps).

## More Neat Stuff
This is meant to be a basic demonstration, but there is much more that you can do:  

**Auto-reload**  
When you make changes to your lambda code, `bst` and `bstpy` will automatically re-load the changes without restarting the server.

**Debugging**  
You can step through your code using your favorite IDE. [Follow this tutorial](tutorial_lambda_debugger) to learn how easy this is to setup.

**Webhooks**  
Using the URL printed out when the `bst proxy` starts up, you can access your local service from across the web.

<img src='../../assets/images/bst-lambda-local-proxy.png' />

Take the URL that is printed out for you and see that you can hit it from anywhere on the web.

This is extremely useful for debugging Webhook-based services (like Facebook Messenger Platform, Alexa Skills, Slack Webhooks, Microsoft Bot framework, etc.) that require having a public-facing server.

**Deployment**  
For Node.js Lambdas, we have a one-step deploy tool. You can [read about it here](../commands/deploy).

**Alexa Skills**  
We have built this originally to make it super-easy to develop Alexa skills. We offer an [array of commands and APIs](http://docs.bespoken.io) that aim to make developing for Alexa faster and more bullet-proof.
