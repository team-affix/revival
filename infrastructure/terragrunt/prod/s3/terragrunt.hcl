# Include all settings from the root root.hcl file
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# Specify the terraform source code location
terraform {
  source = "../../../terraform/s3"
}

# Environment-specific inputs
inputs = {
  environment = "prod"
} 