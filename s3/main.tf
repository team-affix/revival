############################################################################
# USERS SHOULD MODIFY THESE VARIABLES FOR THEIR PUBLISHER'S INFRASTRUCTURE #
############################################################################

variable "AWS_REGION" {
  description = "AWS region"
  type        = string
}

variable "S3_BUCKET_NAME" {
  description = "S3 bucket name"
  type        = string
}

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
  region = var.AWS_REGION
}

############################################################################
############################### AWS S3 BUCKET ##############################
############################################################################

resource "aws_s3_bucket" "lpk_bucket" {
  bucket = var.S3_BUCKET_NAME
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