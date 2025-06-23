stack {
  name        = "ECR Repository - Dev"
  description = "ECR repository for the dev environment"
  id          = "ecr-dev"
}

# Generate the main Terraform configuration
generate_hcl "_main.tf" {
  content {
    module "ecr" {
      source = "../../../modules/ecr"
      
      aws_region      = var.aws_region
      resource_prefix = var.resource_prefix
    }
  }
}

# Generate terraform.tfvars (ECR doesn't need environment variable)
generate_file "terraform.tfvars" {
  content = <<-EOT
    resource_prefix = "${global.resource_prefix}"
  EOT
} 