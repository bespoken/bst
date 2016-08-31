
In order to leverage the bst proxy functionality, you must configure your skill from the Amazon Developer Console to point to the bst proxy server.

![bst proxy](https://bespoken.tools/assets/bst-proxy-flow.gif)

## Configure your Skill Endpoint ###

When you run the bst proxy command, you will see a URL output:

```bash
$ bst proxy lambda index.js
BST: v0.6.5  Node: v4.3.2

Your URL for Alexa Skill configuration:
https://proxy.bespoken.tools?node-id=0c6a4f17-c86f-4024-ba26-a351ac319431
```

From your [Skill's list](https://developer.amazon.com/edw/home.html#/skills/list), select an existing skill to edit or create a new one.  Navigate to the Configuration step and update the HTTPS endpoint to the one provided by the proxy command.

![bst proxy endpoint](https://bespoken.tools/assets/posts/introducing-bst-proxy-for-alexa-skills/configure-skill.gif)

Make sure Account linking is set to "No" and on the SSL Certificate step select "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority".

__ Note__ To help generate your configuration URL, you can also use [bst proxy urlgen](/commands/proxy#bst-proxy-urlgen)

## Path Component for proxy http

When using bst proxy http for local servers running on a specific port, you need to make sure your path components are correct.

For example, when you run the bst proxy http command:

```bash
$ bst proxy http 9999
BST: v0.6.5  Node: v4.3.2

Your URL for Alexa Skill configuration:
https://proxy.bespoken.tools/YOUR/SKILL/PATH?node-id=0c6a4f17-c86f-4024-ba26-a351ac319431
(Be sure to put in your real path and other query string parameters!)
```

And your local server listens on path `/alexa-skill`, you need to update the URL with your path before configuring your Skill.

```
https://proxy.bespoken.tools/alexa-skill?node-id=0c6a4f17-c86f-4024-ba26-a351ac319431
```
