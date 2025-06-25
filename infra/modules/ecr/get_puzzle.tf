############################################################################
##################### GET PUZZLE ECR REPOSITORY ###########################
############################################################################

resource "aws_ecr_repository" "get_puzzle_repository" {
  name                 = "${var.resource_prefix}-get-puzzle"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "get_puzzle_lifecycle" {
  repository = aws_ecr_repository.get_puzzle_repository.name
  policy     = local.lifecycle_policy
} 