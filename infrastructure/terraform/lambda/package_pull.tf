############################################################################
#################### PACKAGE PULL LAMBDA CONFIGURATION ####################
############################################################################

# S3 policy for package_pull_lambda (read-only)
resource "aws_iam_role_policy" "lpk_lambda_package_pull_s3_access" {
  name = "${local.resource_prefix}-lambda-package-pull-s3-policy"
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
  function_name = "${local.resource_prefix}-package-pull-lambda"
  handler       = "dist/index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lpk_lambda_exec_role.arn

  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_name
    }
  }

  filename         = data.archive_file.lpk_placeholder_lambda_payload.output_path
  source_code_hash = data.archive_file.lpk_placeholder_lambda_payload.output_base64sha256

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
} 