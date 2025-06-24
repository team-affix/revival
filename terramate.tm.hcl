# Terramate Configuration
# Global configuration for the APM infrastructure project

terramate {
  config {
    # Enable experimental features
    experiments = []

    # Configure Git integration
    git {
      default_branch = "main"
      default_remote = "origin"
    }
  }
}

# Global variables available to all stacks
globals {
  # Project settings
  project_name = "revival"
  aws_region   = "us-west-1"

  # Terraform backend configuration
  terraform_backend = {
    bucket         = "${global.project_name}-terraformstate"
    region         = global.aws_region
    dynamodb_table = "${global.project_name}-terraform-locks"
    encrypt        = true
  }

  # Common tags
  common_tags = {
    Project     = global.project_name
    ManagedBy   = "terramate"
    Environment = tm_try(global.environment, "unknown")
  }
}

# Generate backend configuration for all stacks
generate_hcl "_backend.tf" {
  content {
    terraform {
      backend "s3" {
        bucket         = global.terraform_backend.bucket
        key            = "${tm_try(global.environment, "unknown")}/${terramate.stack.path.basename}/terraform.tfstate"
        region         = global.terraform_backend.region
        dynamodb_table = global.terraform_backend.dynamodb_table
        encrypt        = global.terraform_backend.encrypt
      }
    }
  }
}

# Generate provider configuration for all stacks
generate_hcl "_provider.tf" {
  content {
    terraform {
      required_version = ">= 1.0"

      required_providers {
        aws = {
          source  = "hashicorp/aws"
          version = "~> 5.0"
        }
        archive = {
          source  = "hashicorp/archive"
          version = "~> 2.0"
        }
        docker = {
          source  = "kreuzwerker/docker"
          version = "~> 3.0"
        }
      }
    }

    provider "aws" {
      region = var.aws_region

      default_tags {
        tags = var.common_tags
      }
    }
  }
}

# Generate common variables for all stacks
generate_hcl "_variables.tf" {
  content {
    variable "aws_region" {
      description = "AWS region"
      type        = string
      default     = global.aws_region
    }

    variable "project_name" {
      description = "Project name"
      type        = string
      default     = global.project_name
    }

    variable "environment" {
      description = "Environment name"
      type        = string
    }

    variable "resource_prefix" {
      description = "Resource prefix"
      type        = string
    }

    variable "common_tags" {
      description = "Common tags to apply to all resources"
      type        = map(string)
      default     = global.common_tags
    }
  }
} 