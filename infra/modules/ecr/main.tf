############################################################################
########################### VARIABLES CONFIGURATION #######################
############################################################################

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "resource_prefix" {
  type        = string
  description = "Resource prefix (includes project and environment)"
}

############################################################################
########################### COMMON CONFIGURATION #########################
############################################################################

locals {
  lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last 5 untagged images"
        selection = {
          tagStatus   = "untagged"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

############################################################################
############################# OUTPUTS ###################################
############################################################################

output "package_pull_repository_url" {
  description = "URL of the package-pull ECR repository"
  value       = aws_ecr_repository.package_pull_repository.repository_url
}

output "package_pull_repository_arn" {
  description = "ARN of the package-pull ECR repository"
  value       = aws_ecr_repository.package_pull_repository.arn
}

output "package_push_repository_url" {
  description = "URL of the package-push ECR repository"
  value       = aws_ecr_repository.package_push_repository.repository_url
}

output "package_push_repository_arn" {
  description = "ARN of the package-push ECR repository"
  value       = aws_ecr_repository.package_push_repository.arn
}

output "get_puzzle_repository_url" {
  description = "URL of the get-puzzle ECR repository"
  value       = aws_ecr_repository.get_puzzle_repository.repository_url
}

output "get_puzzle_repository_arn" {
  description = "ARN of the get-puzzle ECR repository"
  value       = aws_ecr_repository.get_puzzle_repository.arn
}
