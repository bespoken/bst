# Bespoken Java Sample
Alexa Demo

## Concepts
These samples shows how to create Alexa Skill working with the bst

## Debugging
To run it locally, use this command:
`mvn compile exec:java -DdisableRequestSignatureCheck=true`

## Releasing
Running release prepare will version the repo - it is sufficient
`mvn -B release:clean release:prepare release:perform`

The -B flag runs it in non-interactive mode.
