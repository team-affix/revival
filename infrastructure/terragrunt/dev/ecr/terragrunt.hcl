# Include all settings from the root root.hcl file
include "root" {
  path = find_in_parent_folders("root.hcl")
  merge_strategy = "deep"
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Generate provider block with both AWS and Docker providers for ECR
# This will override the provider block from root.hcl
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
EOF
}

# Specify the terraform source code location
terraform {
  source = "../../../terraform/ecr"
}

# Environment-specific inputs
inputs = {
}
