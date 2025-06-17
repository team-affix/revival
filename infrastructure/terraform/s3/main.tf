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

variable "environment" {
    type = string
    description = "Environment (dev, prod, etc.)"
}

############################################################################
########################### LOCALS CONFIGURATION ###########################
############################################################################

locals {
    resource_prefix = "${var.project_name}-${var.environment}"
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