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

# Generate outputs to expose module outputs at stack level
generate_hcl "_outputs.tf" {
  content {
    output "package_pull_repository_url" {
      description = "URL of the package-pull ECR repository"
      value       = module.ecr.package_pull_repository_url
    }

    output "package_pull_repository_arn" {
      description = "ARN of the package-pull ECR repository"
      value       = module.ecr.package_pull_repository_arn
    }

    output "package_push_repository_url" {
      description = "URL of the package-push ECR repository"
      value       = module.ecr.package_push_repository_url
    }

    output "package_push_repository_arn" {
      description = "ARN of the package-push ECR repository"
      value       = module.ecr.package_push_repository_arn
    }

    output "get_puzzle_repository_url" {
      description = "URL of the get-puzzle ECR repository"
      value       = module.ecr.get_puzzle_repository_url
    }

    output "get_puzzle_repository_arn" {
      description = "ARN of the get-puzzle ECR repository"
      value       = module.ecr.get_puzzle_repository_arn
    }
  }
}

# Generate terraform.tfvars (ECR doesn't need environment variable)
generate_file "terraform.tfvars" {
  content = <<-EOT
    resource_prefix = "${global.resource_prefix}"
    environment     = "dev"
  EOT
} 