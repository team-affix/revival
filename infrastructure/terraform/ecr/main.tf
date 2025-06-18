############################################################################
########################### VARIABLES CONFIGURATION #######################
############################################################################

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Environment (dev, prod, etc.)"
}

############################################################################
######################## LOCAL VARIABLES ###################################
############################################################################

locals {
  resource_prefix = "${var.project_name}-${var.environment}"
}

############################################################################
########################### ECR REPOSITORY ###############################
############################################################################

resource "aws_ecr_repository" "lpk_ecr_repository" {
  name                 = "${local.resource_prefix}-ecr-repository"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "lpk_ecr_repository_lifecycle" {
  repository = aws_ecr_repository.lpk_ecr_repository.name

  policy = jsonencode({
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
########################### DOCKER BUILD/PUSH ############################
############################################################################

# Get ECR authorization token
data "aws_ecr_authorization_token" "token" {}

# Configure Docker provider with ECR credentials
provider "docker" {
  registry_auth {
    address  = data.aws_ecr_authorization_token.token.proxy_endpoint
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}

# Build Docker image from Dockerfile
resource "docker_image" "lpk_docker_image" {
  name = "${aws_ecr_repository.lpk_ecr_repository.repository_url}:latest"

  build {
    context    = "${path.module}/docker_files"
    dockerfile = "Dockerfile"
    tag        = ["${aws_ecr_repository.lpk_ecr_repository.repository_url}:latest"]

    build_args = {
      BUILDKIT_INLINE_CACHE = "1"
    }
  }

  # Rebuild when Dockerfile or any file in context changes
  triggers = {
    dockerfile_hash = filemd5("${path.module}/docker_files/Dockerfile")
    context_hash    = sha256(join("", [for f in fileset("${path.module}/docker_files", "**") : filesha256("${path.module}/docker_files/${f}")]))
  }
}

# Push image to ECR
resource "docker_registry_image" "lpk_registry_image" {
  name = docker_image.lpk_docker_image.name

  keep_remotely = true # Keep image in ECR when Terraform destroys

  triggers = {
    image_id = docker_image.lpk_docker_image.image_id
  }
}

############################################################################
############################# OUTPUTS ###################################
############################################################################

output "repository_name" {
  description = "Name of the ECR repository"
  value       = aws_ecr_repository.lpk_ecr_repository.name
}

output "repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.lpk_ecr_repository.repository_url
}

output "repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.lpk_ecr_repository.arn
}

output "image_uri" {
  description = "Full URI of the pushed Docker image"
  value       = "${aws_ecr_repository.lpk_ecr_repository.repository_url}:latest"
}

output "registry_id" {
  description = "Registry ID of the ECR repository"
  value       = aws_ecr_repository.lpk_ecr_repository.registry_id
}
