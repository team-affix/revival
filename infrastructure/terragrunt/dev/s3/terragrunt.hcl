# Include all settings from the root terragrunt.hcl file
include "root" {
  path = find_in_parent_folders()
}

# Specify the terraform source code location
terraform {
  source = "../../../terraform/s3"
}

# Environment-specific inputs
inputs = {
  environment = "dev"
} 