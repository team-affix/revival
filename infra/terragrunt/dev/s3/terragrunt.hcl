# Include all settings from the root root.hcl file
include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Specify the terraform source code location
terraform {
  source = "../../../modules/s3"
}

# Environment-specific inputs
inputs = {
}
