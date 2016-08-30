## Configuring Your Skill For bst proxy

In order to leverage the bst proxy functionality, you must configure your skill from the Amazon Develop Console to point to the bst server.

### Configure the Endpoint ###

Your skill must be setup to point to the bst server. For example, if the URL for your skill is normally:
```
https://myskill.example.com/skillA
```

It should instead be configured to point like so:
```
https://proxy.bespoken.tools/skillA?node-id=1b84270f-5b58-4176-a8b6-7b5b1c03a308
```

From your [Skill's list](https://developer.amazon.com/edw/home.html#/skills/list), click edit and navigate the Configuration step and update the HTTPS endpoint
<p align="center">
  <img src="https://bespoken.tools/img/skill-configuration-http.png" />
</p>

__Please Note__ Account linking should be set to "No"

To help generate your the URL, see [$ bst proxy urlgen](https://github.com/bespoken/bst#-proxy-urlgen)


### SSL Certificate ###

Select "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority"

<p align="center">
  <img src="https://bespoken.tools/img/skill-ssl-certificate.png" />
</p>