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

# Generate terraform.tfvars (S3 doesn't need environment variable)
generate_file "terraform.tfvars" {
  content = <<-EOT
    resource_prefix = "${global.resource_prefix}"
  EOT
} 