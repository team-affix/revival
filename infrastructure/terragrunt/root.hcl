locals {
  aws_region = "us-west-1"
  project_name = "revival"
}

# Configure Terragrunt to automatically store tfstate files in an S3 bucket
remote_state {
  backend = "s3"
  config = {
    encrypt        = true
    bucket         = "${local.project_name}-terraformstate"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    use_lockfile   = true
    dynamodb_table = "${local.project_name}-terraform-locks"
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# Generate an AWS provider block
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
  }
}

provider "aws" {
  region = var.aws_region
}
EOF
}

# Configure common input variables
inputs = {
  aws_region   = local.aws_region
  project_name = local.project_name
}
