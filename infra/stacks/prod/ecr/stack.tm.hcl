stack {
  name        = "ECR Repository - Prod"
  description = "ECR repository for the prod environment"
  id          = "ecr-prod"
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

# Generate outputs to expose module outputs at stack level
generate_hcl "_outputs.tf" {
  content {
    output "repository_url" {
      description = "URL of the ECR repository"
      value       = module.ecr.repository_url
    }

    output "repository_name" {
      description = "Name of the ECR repository"
      value       = module.ecr.repository_name
    }

    output "repository_arn" {
      description = "ARN of the ECR repository"
      value       = module.ecr.repository_arn
    }
  }
}

# Generate terraform.tfvars (ECR doesn't need environment variable)
generate_file "terraform.tfvars" {
  content = <<-EOT
    resource_prefix = "${global.resource_prefix}"
  EOT
} 