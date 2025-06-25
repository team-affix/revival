############################################################################
##################### PACKAGE PUSH ECR REPOSITORY #########################
############################################################################

resource "aws_ecr_repository" "package_push_repository" {
  name                 = "${var.resource_prefix}-package-push"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "package_push_lifecycle" {
  repository = aws_ecr_repository.package_push_repository.name
  policy     = local.lifecycle_policy
} 