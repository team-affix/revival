# Include all settings from the root root.hcl file
include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Specify the terraform source code location
terraform {
  source = "../../../modules/lambda"
}

# Define dependencies
dependency "s3" {
  config_path = "../s3"
}

locals {
  # change the relative bit to match where the file lives
  external_file_path = get_terragrunt_dir()
}

# Environment-specific inputs
inputs = {
  s3_bucket_name  = dependency.s3.outputs.bucket_name
  s3_bucket_arn   = dependency.s3.outputs.bucket_arn
  terragrunt_module_path = local.external_file_path
}
