############################################################################
######################## TERRAFORM BASIC CONFIGURATION #####################
############################################################################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {}
}

############################################################################
########################### VARIABLES CONFIGURATION #######################
############################################################################

variable "aws_region" {
    type = string
    description = "AWS region"
}

variable "project_name" {
    type = string
    description = "Project name"
}

############################################################################
# S3 MODULE CONFIGURATION
############################################################################

############################################################################
########################### LOCALS CONFIGURATION ###########################
############################################################################

locals {
    resource_prefix = "${var.project_name}-${terraform.workspace}"
}

############################################################################
########################### AWS BASIC CONFIGURATION ########################
############################################################################

provider "aws" {
  region = var.aws_region
}

############################################################################
############################### AWS S3 BUCKET ##############################
############################################################################

resource "aws_s3_bucket" "lpk_bucket" {
  bucket = "${local.resource_prefix}-apm-registry"
}

############################################################################
############################# OUTPUTS ###################################
############################################################################

output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.lpk_bucket.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.lpk_bucket.arn
}

output "bucket_id" {
  description = "ID of the S3 bucket"
  value       = aws_s3_bucket.lpk_bucket.id
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.lpk_bucket.bucket_domain_name
}
