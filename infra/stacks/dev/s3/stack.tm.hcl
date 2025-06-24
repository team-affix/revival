stack {
  name        = "S3 Bucket - Dev"
  description = "S3 bucket for the dev environment"
  id          = "s3-dev"
}

# Generate the main Terraform configuration
generate_hcl "_main.tf" {
  content {
    module "s3" {
      source = "../../../modules/s3"

      aws_region      = var.aws_region
      resource_prefix = var.resource_prefix
    }
  }
}

# Generate outputs to expose module outputs at stack level
generate_hcl "_outputs.tf" {
  content {
    output "bucket_name" {
      description = "Name of the S3 bucket"
      value       = module.s3.bucket_name
    }

    output "bucket_arn" {
      description = "ARN of the S3 bucket"
      value       = module.s3.bucket_arn
    }

    output "bucket_id" {
      description = "ID of the S3 bucket"
      value       = module.s3.bucket_id
    }

    output "bucket_domain_name" {
      description = "Domain name of the S3 bucket"
      value       = module.s3.bucket_domain_name
    }
  }
}

# Generate terraform.tfvars (S3 doesn't need environment variable)
generate_file "terraform.tfvars" {
  content = <<-EOT
    resource_prefix = "${global.resource_prefix}"
    environment     = "${global.environment}"
  EOT
} 