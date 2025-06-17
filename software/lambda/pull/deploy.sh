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

echo "🚀 Deploying Lambda function to $ENVIRONMENT environment..."

# Get the function name from Terragrunt output
FUNCTION_NAME=$(cd ../../../infrastructure/terragrunt/$ENVIRONMENT/lambda && terragrunt output -raw lambda_function_name)

if [ -z "$FUNCTION_NAME" ]; then
    echo "❌ Error: Could not get function name from Terragrunt output"
    echo "Make sure the infrastructure is deployed first: cd infrastructure/terragrunt/$ENVIRONMENT/lambda && terragrunt apply"
    exit 1
fi

echo "📦 Function name: $FUNCTION_NAME"

# Package the function
echo "📦 Packaging function..."
cd function
zip -r ../function.zip .
cd ..

# Update the function code
echo "🔄 Updating function code..."
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://function.zip

# Clean up
rm function.zip
