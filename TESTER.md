# Notes on tests

## Deploying Node packages

Make sure the project follows the Node conventions. 

- package.json in to folder
- you have an index.js in the top folder
- your index.js exports a function called 'handler'

## AWS credentials

Don't forget to set the 

`AWS_SECRET_ACCESS_KEY` and `AWS_ACCESS_KEY_ID` 

environment variables!

## Cleanup after deploy 

- Delete lambda function

```
aws lambda delete-function --function-name <your_function>
```

- Delete role stuff (in this order). 

These commands will delete the defaults (role, policy, function):

```
aws lambda delete-function --function-name node-lambda-template; \
aws iam delete-role-policy --role-name lambda-bst-execution --policy-name lambda-bst-execution-access; \
aws iam delete-role --role-name lambda-bst-execution
```

- Invoking the lambda

http://docs.aws.amazon.com/lambda/latest/dg/with-userapp-walkthrough-custom-events-invoke.html
