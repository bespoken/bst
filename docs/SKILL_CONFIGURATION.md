## Configuring Your Skill For bst proxy

In order to leverage the bst proxy functionality, you must configure your skill to point to the bst server.

### Configure the Endpoint ###

Your skill must be setup to point to the bst server. For example, if the URL for your skill is normally:
```
https://myskill.example.com/skillA
```

It should instead be configured to point like so:
```
https://bst.xappmedia.com/skillA?node-id=JPK
```

Navigate to the Configuration step and update the HTTPS endpoint
<p align="center">
  <img src="https://bespoken.tools/img/skill-configuration-http.png" />
</p>

Also, account linking should be set to "No"

To help generate your the URL, see [$ bst proxy urlgen](https://github.com/bespoken/bst#proxy-urlgen)


### SSL Certificate ###

Select "My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority"

<p align="center">
  <img src="https://bespoken.tools/img/skill-ssl-certificate.png" />
</p>