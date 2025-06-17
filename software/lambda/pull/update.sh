# Update the lambda function code via zip file

# Get the lambda function name
cd ../../../infrastructure/lambda
lambda_function_name=$(terraform output -raw lambda_function_name)
echo "Lambda function name: $lambda_function_name"
cd ../../software/lambda/pull/function

# Zip the lambda function code
zip -r ../lambda_function_code.zip .
cd ../

# Update the lambda function code
aws lambda update-function-code \
    --function-name $lambda_function_name \
    --zip-file fileb://lambda_function_code.zip
