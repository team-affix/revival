# Include all settings from the root terragrunt.hcl file
include "root" {
  path = find_in_parent_folders()
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
  environment            = "dev"
  lambda_function_name   = dependency.lambda.outputs.lambda_function_name
  lambda_function_arn    = dependency.lambda.outputs.lambda_function_arn
  lambda_invoke_arn      = dependency.lambda.outputs.lambda_function_invoke_arn
} 