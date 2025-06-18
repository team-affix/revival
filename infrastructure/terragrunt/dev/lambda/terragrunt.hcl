# Include all settings from the root root.hcl file
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# Specify the terraform source code location
terraform {
  source = "../../../terraform/lambda"
}

# Define dependencies
dependency "s3" {
  config_path = "../s3"
}

# Environment-specific inputs
inputs = {
  environment     = "dev"
  s3_bucket_name  = dependency.s3.outputs.bucket_name
  s3_bucket_arn   = dependency.s3.outputs.bucket_arn
}
