############################################################################
#################### PACKAGE PUSH LAMBDA CONFIGURATION ####################
############################################################################

# Build Docker image
resource "docker_image" "package_push_image" {
  name = "${var.package_push_repository_url}:latest"

  build {
    context    = "${path.module}/../../../software/server/lambda/push/function"
    dockerfile = "Dockerfile"
    tag        = ["${var.package_push_repository_url}:latest"]

    build_args = {
      BUILDKIT_INLINE_CACHE = "1"
    }
  }

  # Trigger rebuild when source code changes
  triggers = {
    source_hash = sha256(join("", [
      for f in fileset("${path.module}/../../../software/server/lambda/push/function", "**")
      : filesha256("${path.module}/../../../software/server/lambda/push/function/${f}")
    ]))
  }
}

# Push image to ECR
resource "docker_registry_image" "package_push_registry_image" {
  name = docker_image.package_push_image.name

  keep_remotely = true

  triggers = {
    image_id = docker_image.package_push_image.image_id
  }
}

# S3 policy for package_push_lambda (read/write)
resource "aws_iam_role_policy" "lpk_lambda_package_push_s3_access" {
  name = "${var.resource_prefix}-lambda-package-push-s3-policy"
  role = aws_iam_role.lpk_lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      Resource = [
        var.s3_bucket_arn,
        "${var.s3_bucket_arn}/*"
      ]
    }]
  })
}

# Package Push Lambda Function
resource "aws_lambda_function" "lpk_package_push_lambda" {
  function_name = "${var.resource_prefix}-package-push-lambda"
  role          = aws_iam_role.lpk_lambda_exec_role.arn

  # Use container image
  package_type = "Image"
  image_uri    = docker_registry_image.package_push_registry_image.name

  # Lambda container image config
  image_config {
    command = ["dist/index.handler"]
  }
  
  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_name
    }
  }
} 