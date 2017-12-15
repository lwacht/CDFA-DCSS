# CDFA DCSS Interface

The serverless application connects the CDFA Cannabis Licensing System to DCSS.

## Prerequisites

  * npm
  * node.js v6.10.3
  * AWS CLI

## Running the tests

Running the tests with Jest
```
npm test
```
## Deployment

1. Package and upload to s3
    ```
    aws cloudformation package --template-file template.yml --s3-bucket {s3 bucket name} --output-template-file packaged-template.yaml
    ```
    Example
    ```
    aws cloudformation package --template-file template.yml --s3-bucket dcss-dev-deployments --output-template-file packaged-template.yaml
    ```
1. Deploy using CloudFormation.
    ```
    aws cloudformation deploy --template-file packaged-template.yaml --stack-name dcss-{env} --capabilities CAPABILITY_NAMED_IAM --parameter-overrides Environment={env} HashKey={hashKey} AwsUsGov={aws || aws-us-gov} SftpHost={dcss ftp host} SftpUser={dcss ftp user} SftpPassword={dcss ftp password}
    ```
    Example
    ```
    aws cloudformation deploy --template-file packaged-template.yaml --stack-name dcss-dev --capabilities CAPABILITY_NAMED_IAM --parameter-overrides Environment=dev HashKey=TESTING AwsUsGov=aws-us-gov SftpHost=grayquarter.brickftp.com SftpUser=jt@grayquarter.com SftpPassword=c@nn@b15
    ```
