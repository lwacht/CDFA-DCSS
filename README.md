# CDFA DCSS Interface

The serverless application connects the CDFA Cannabis Licensing System to DCSS. This README intends to provide 
instructions to setup a developer machine to run unit tests and deploy the application to AWS. 

# Source code structure
The following describes the source code organizational structure and naming conventions used for this project.
  * __src__ -- All the source code for this project is stored within this directory.
    * __api__ -- The source code for the APIs is located here.
      * __status__ -- The Lambda and supporting libraries for the status API will have *status* in the name.
      * __action-taken__ -- The Lambda and supporting libraries for the action taken API will have *action-taken* in the name.
    * __export__ -- The source code for the export (to DCSS) functionality is located here.
      * __action-taken__ -- The Lambda and supporting libraries for the action taken export will have *action-taken* in the name.
      * __action-taken-stats__ -- The Lambda and supporting libraries for the action taken statistics export will have *action-taken-stats* in the name.
      * __outgoing-sftp__ -- The Lambda and supporting libraries for exporting the flat files to the DCSS sftp server will have *outgoing-sftp* in the name.
    * __import__ -- The source code for the import (from DCSS) functionality is located here.
      * __delinquency__ -- The Lambda and supporting libraries for the monthly delinquency import will have *delinquency* in the name.
      * __daily-release__ -- The Lambda and supporting libraries for the daily release import will have *daily-release* in the name. 
    * __util__ -- This directory contains reusable libraries that are shared across functional areas.
  * __test__ -- This directory contains all unit and integration tests for the source code. 
  The test naming convention will follow the source code followed by `.test.js` for example `src/util/encrypt.js` has a 
  corresponding test located at `test/util/encrypt.test.js`. Test resources are also stored along side the test files. 
  For example some delinquency import files are stored at `test/import/delinquency-import-test-1.txt`. The test resources 
  will end in the `.txt` suffix.

## Prerequisites

  * Install GitHub App or favorite git client (<https://desktop.github.com/>)
  * Install node.js v6.10.3 (needs to match AWS Lambda version) and npm (<https://nodejs.org/en/download/>)
    * `node -v` to verify installation and version
  * Install AWS CLI (<https://aws.amazon.com/cli/>)
    * `aws --version` to verify installation
  * Configure AWS CLI
    * Create a user and access tokens for unit tests and deployment
    * Run `aws configure` and enter in access tokens
  * At the root level of this project call the following command to setup the libraries
    ```
    npm install 
    ```
## Running the tests
### Unit tests prerequisites
  * Create the following buckets with read/write/delete privileges for the user created above
    * dcss-local-test-action-taken-export-bucket
    * dcss-local-test-daily-release-import-bucket
    * dcss-local-test-delinquency-import-bucket
  * Create the following dynamoDB tables with read/write/delete privileges for the user created above
    * dcss-local-test-dcss-table
      * primary key `id`
      * add index `ssnHash-index` on partiion key `ssnHash`
      * add index `stateIdHash-index` on partition key `stateIdHash`
    * dcss-local-test-action-taken-table
      * primary key `agencyCustomerId` with sort key `timestamp`
      * add index `actionTakenDate-index` on partition key `actionTakenDate`
      * add index `actionTakenMonthYear-index` on partition key `actionTakenMonthYear`
  * Create a kms encryption key with the alias `dcss-local-test-key`
    * Allow the user created above 'User' permissions of the key
   

### Running the tests
Running the tests with Jest
```
npm test
```

To run one test use the Jest command
```
jest {path to the test}
```
example
```
jest test/util/action-taken-service.addRecord.test.js
```
## Deployment
### Environment variables

  * Environment -- The environment to deploy to example (dev, test, prod)
  * HashKey -- The hash key to be used to hash ssn and stateId for searching. This can be something like 'TESTING' for dev and testing. For production use a real hash key. Example `a5a3a27a38ef849dc9016b2ed020c35d`. DON'T LOSE THIS FOR PRODUCTION!!
  * AwsUsGov -- Should be `aws-us-gov` if running this stack on a non gov cloud AWS you can use `aws`
  * SftpHost -- The sftp host for dcss or a test sftp host for dev/test.
  * SftpUser -- The sftp user for dcss or a test sftp user for dev/test.
  * SftpPassword -- The sftp password for dcss or a test sftp password for dev/test.
  
### Deployment commands  

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