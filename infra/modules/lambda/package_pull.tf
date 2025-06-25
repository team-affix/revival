############################################################################
#################### PACKAGE PULL LAMBDA CONFIGURATION ####################
############################################################################

# Build Docker image
resource "docker_image" "package_pull_image" {
  name = "${var.package_pull_repository_url}:latest"

  build {
    context    = "${path.module}/../../../software/server/lambda/pull/function"
    dockerfile = "Dockerfile"
    tag        = ["${var.package_pull_repository_url}:latest"]

    build_args = {
      BUILDKIT_INLINE_CACHE = "1"
    }
  }

  # Trigger rebuild when source code changes
  triggers = {
    source_hash = sha256(join("", [
      for f in fileset("${path.module}/../../../software/server/lambda/pull/function", "**")
      : filesha256("${path.module}/../../../software/server/lambda/pull/function/${f}")
    ]))
  }
}

# Push image to ECR
resource "docker_registry_image" "package_pull_registry_image" {
  name = docker_image.package_pull_image.name

  keep_remotely = true

  triggers = {
    image_id = docker_image.package_pull_image.image_id
  }
}

# S3 policy for package_pull_lambda (read-only)
resource "aws_iam_role_policy" "lpk_lambda_package_pull_s3_access" {
  name = "${var.resource_prefix}-lambda-package-pull-s3-policy"
  role = aws_iam_role.lpk_lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      Resource = [
        var.s3_bucket_arn,
        "${var.s3_bucket_arn}/*"
      ]
    }]
  })
}

# Package Pull Lambda Function
resource "aws_lambda_function" "lpk_package_pull_lambda" {
  function_name = "${var.resource_prefix}-package-pull-lambda"
  role          = aws_iam_role.lpk_lambda_exec_role.arn

  # Use container image
  package_type = "Image"
  image_uri    = docker_registry_image.package_pull_registry_image.name
  source_code_hash = docker_registry_image.package_pull_registry_image.sha256_digest

  # Lambda container image config
  image_config {
    command = ["dist/index.handler"]
  }
  
  # Add timeout and memory configurations
  timeout     = 30  # 30 seconds should be enough for most package downloads
  memory_size = 1024  # 1GB of memory should provide good performance for file processing
  
  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_name
    }
  }
} 