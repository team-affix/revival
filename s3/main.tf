############################################################################
# S3 MODULE CONFIGURATION
############################################################################

# Use common module for shared variables and naming
module "common" {
  source = "../common"
}

############################################################################
########################### LOCALS CONFIGURATION ###########################
############################################################################


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
}

############################################################################
########################### AWS BASIC CONFIGURATION ########################
############################################################################

provider "aws" {
  region = module.common.aws_region
}

############################################################################
############################### AWS S3 BUCKET ##############################
############################################################################

resource "aws_s3_bucket" "lpk_bucket" {
  bucket = "${module.common.resource_prefix}-apm-registry"
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
