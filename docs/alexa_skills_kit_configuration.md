
In order to leverage the bst proxy functionality, you must configure your skill from the Amazon Developer Console to point to the bst proxy server.

![bst proxy](https://bespoken.io/wp-content/uploads/bst-proxy-flow.gif)

## Configure your Skill Endpoint ###

When you run the bst proxy command, you will see a URL output:

```bash
$ bst proxy lambda index.js
BST: v1.0.4  Node: v4.3.2

Your public URL for accessing your local service:
https://determined-rice.bespoken.link
```

From your [Skill's list](https://developer.amazon.com/edw/home.html#/skills/list), select an existing skill to edit or create a new one.  Navigate to the Configuration step and update the HTTPS endpoint to the one provided by the proxy command.

![bst proxy endpoint](https://bespoken.io/wp-content/uploads/configure-skill.gif)

Make sure Account linking is set to "No" and on the SSL Certificate step select "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority".

## Path Component for proxy http

When using bst proxy http for local servers running on a specific port, you need to make sure your path components are correct.

For example, when you run the bst proxy http command:

```bash
$ bst proxy http 9999
BST: v1.0.4  Node: v4.3.2

Your public URL for accessing your local service:
https://determined-rice.bespoken.link
```

If your local server listens on path `/alexa-skill`, you need to update the URL with your path before configuring your Skill.

```
Your public URL for accessing your local service:
https://determined-rice.bespoken.link/alexa-skill
```
