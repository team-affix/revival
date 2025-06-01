
############################################################################
# USERS SHOULD MODIFY THESE VARIABLES FOR THEIR PUBLISHER'S INFRASTRUCTURE #
############################################################################

locals {
  region       = "us-west-1"
  s3_bucket_name  = "lpk-revival"
  lambda_package_pull_name = "lpk-revival-package-pull"
}

############################################################################
############################################################################

# LOCAL VARS, USERS SHOULD NOT MODIFY THESE
locals {
  lambda_package_pull_src_file_name = "index.js"
  lambda_package_pull_src_file_path = "./lambda/pull/${local.lambda_package_pull_src_file_name}"
  lambda_package_pull_payload_file_path = "./lambda/pull/function.zip"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = local.region
}

resource "aws_s3_bucket" "bucket" {
  bucket = local.s3_bucket_name
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy_attachment" "lambda_basic_execution" {
  name       = "lambda_basic_execution"
  roles      = [aws_iam_role.lambda_exec_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "package_pull_lambda_payload" {
  type        = "zip"
  source_file  = local.lambda_package_pull_src_file_path
#   excludes    = ["venv", "_pycache_"]
  output_path = local.lambda_package_pull_payload_file_path
}

resource "aws_lambda_function" "package_pull_lambda" {
  function_name = local.lambda_package_pull_name
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = local.lambda_package_pull_payload_file_path

  role = aws_iam_role.lambda_exec_role.arn

  source_code_hash = data.archive_file.package_pull_lambda_payload.output_base64sha256
}
