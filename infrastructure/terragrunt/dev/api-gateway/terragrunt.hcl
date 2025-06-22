# Include all settings from the root root.hcl file
include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Specify the terraform source code location
terraform {
  source = "../../../terraform/api-gateway"
}

# Define dependencies
dependency "lambda" {
  config_path = "../lambda"
}

# Environment-specific inputs
inputs = {
  # Package Pull Lambda
  package_pull_lambda_function_name = dependency.lambda.outputs.package_pull_lambda_function_name
  package_pull_lambda_function_arn  = dependency.lambda.outputs.package_pull_lambda_function_arn
  package_pull_lambda_invoke_arn    = dependency.lambda.outputs.package_pull_lambda_invoke_arn
  
  # Package Push Lambda
  package_push_lambda_function_name = dependency.lambda.outputs.package_push_lambda_function_name
  package_push_lambda_function_arn  = dependency.lambda.outputs.package_push_lambda_function_arn
  package_push_lambda_invoke_arn    = dependency.lambda.outputs.package_push_lambda_invoke_arn
  
  # Get Puzzle Lambda
  get_puzzle_lambda_function_name = dependency.lambda.outputs.get_puzzle_lambda_function_name
  get_puzzle_lambda_function_arn  = dependency.lambda.outputs.get_puzzle_lambda_function_arn
  get_puzzle_lambda_invoke_arn    = dependency.lambda.outputs.get_puzzle_lambda_invoke_arn
}
