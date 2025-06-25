#!/bin/bash

# Lambda invocation script
# Usage: ./invoke.sh dev|prod cli|api-gateway

set -e
set -x

ENVIRONMENT=$1
ENTRYPOINT=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$ENTRYPOINT" ]; then
    echo "Usage: $0 <environment> <entrypoint>"
    echo "Example: $0 dev cli"
    echo "Example: $0 prod api-gateway"
    exit 1
fi

rm -rf ./absurdity


if [ "$ENTRYPOINT" == "cli" ]; then
    # Get the lambda function name
    lambda_function_name=$(cd ../../../../infra/stacks/$ENVIRONMENT/lambda && terraform output -raw get_puzzle_lambda_function_name)
    # Invoke the lambda function
    aws lambda invoke --function-name "$lambda_function_name" --payload file://payload.json --cli-binary-format raw-in-base64-out out.json
    jq -r '.body' out.json | base64 --decode > response.zip

elif [ "$ENTRYPOINT" == "api-gateway" ]; then
    # Get the package pull api gateway url
    api_gateway_url=$(cd ../../../../infra/stacks/$ENVIRONMENT/api-gateway && terraform output -raw get_puzzle_api_url)

    echo "🚀 Invoking lambda function thru api gateway..."
    echo "API Gateway URL: $api_gateway_url"

    # Invoke the lambda function thru curl
    curl -X POST $api_gateway_url \
    -H "Content-Type: application/json" \
    -d @payload.json | base64 --decode > response.zip

fi

mkdir -p ./absurdity
cd ./absurdity

# rm out.json
unzip ../response.zip
rm ../response.zip
