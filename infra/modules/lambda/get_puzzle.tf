############################################################################
##################### GET PUZZLE LAMBDA CONFIGURATION ######################
############################################################################

# Build Docker image
resource "docker_image" "get_puzzle_image" {
  name = "${var.get_puzzle_repository_url}:latest"

  build {
    context    = "${path.module}/../../../software/server/lambda/get-puzzle/function"
    dockerfile = "Dockerfile"
    tag        = ["${var.get_puzzle_repository_url}:latest"]

    build_args = {
      BUILDKIT_INLINE_CACHE = "1"
    }
  }

  # Trigger rebuild when source code changes
  triggers = {
    source_hash = sha256(join("", [
      for f in fileset("${path.module}/../../../software/server/lambda/get-puzzle/function", "**")
      : filesha256("${path.module}/../../../software/server/lambda/get-puzzle/function/${f}")
    ]))
  }
}

# Push image to ECR
resource "docker_registry_image" "get_puzzle_registry_image" {
  name = docker_image.get_puzzle_image.name

  keep_remotely = true

  triggers = {
    image_id = docker_image.get_puzzle_image.image_id
  }
}

# Get Puzzle Lambda Function (no S3 access needed)
resource "aws_lambda_function" "lpk_get_puzzle_lambda" {
  function_name = "${var.resource_prefix}-get-puzzle-lambda"
  role          = aws_iam_role.lpk_lambda_exec_role.arn

  # Use container image
  package_type = "Image"
  image_uri    = docker_registry_image.get_puzzle_registry_image.name
  source_code_hash = docker_registry_image.get_puzzle_registry_image.sha256_digest
  # Lambda container image config
  image_config {
    command = ["dist/index.handler"]
  }

  # No environment variables needed for puzzle lambda
} 