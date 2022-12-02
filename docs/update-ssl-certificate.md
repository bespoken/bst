# How to update the ssl certificate for bst server

## Format the env certificate values
- Sectigo certificate will be sended in a zip file, it will contain 4 files
- Create a new file, and copy the value from STAR_bespoken_tools.crt and
SectigoRSADomainValidationSecureServerCA.crt, one after the other.
- Escape the new line character on the new file. Replace \n with \\\\n


## Update env variables

- Login into the server, ask for the ssh key
```
ssh -i bst-server.pem ec2-user@35.168.239.220
```

- Backup current .env file
```
cp .env bu-env-20220922.txt
```

- Replace SSL_CERT and CERTIFICATE on the .env file with the updated values.
- Stop the current bst server container
```
docker ps 
docker stop [replace-with-container-id]
```

- Star the container again
```
docker run -d --env-file .env -p 443:443 -p 5000:5000 -p 80:80 bespoken/bst:bst-server-14
```


# Import ssl certificate into aws cert manager

## generate SSL Certificate Trust Chain

Follow instructions to create certificate trust chain https://support.sectigo.com/PS_KnowledgeDetailPage?Id=kA03l00000117PV

## import certificate into aws

Go to and import the certificate
https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/list

