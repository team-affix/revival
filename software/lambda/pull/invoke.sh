set -e

rm -rf ./absurdity

# Get the lambda function name
cd ../../../infrastructure/lambda
lambda_function_name=$(terraform output -raw lambda_function_name)
cd ../../software/lambda/pull

# Invoke the lambda function
aws lambda invoke --function-name "$lambda_function_name" --payload file://payload.json --cli-binary-format raw-in-base64-out out.json

jq -r '.body' out.json | base64 --decode > response.zip
# rm out.json
unzip response.zip
rm response.zip
