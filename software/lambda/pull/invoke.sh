#!/bin/bash

# Lambda deployment script
# Usage: ./deploy.sh dev|prod

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    echo "Example: $0 dev"
    echo "Example: $0 prod"
    exit 1
fi

rm -rf ./absurdity

# Get the lambda function name
cd ../../../infrastructure/terragrunt/$ENVIRONMENT/lambda
lambda_function_name=$(terragrunt output -raw lambda_function_name)
cd ../../../../software/lambda/pull

# Invoke the lambda function
aws lambda invoke --function-name "$lambda_function_name" --payload file://payload.json --cli-binary-format raw-in-base64-out out.json

jq -r '.body' out.json | base64 --decode > response.zip
# rm out.json
unzip response.zip
rm response.zip
