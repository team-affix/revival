
############################################################################
# USERS SHOULD MODIFY THESE VARIABLES FOR THEIR PUBLISHER'S INFRASTRUCTURE #
############################################################################

locals {
  region       = "us-west-1"
  bucket_name  = "lpk-revival"
}

############################################################################
############################################################################

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
  bucket = local.bucket_name
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

resource "aws_lambda_function" "hello_lambda" {
  function_name = "hello-lambda"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = "function.zip"  # relative to where you run terraform

  role = aws_iam_role.lambda_exec_role.arn

  source_code_hash = filebase64sha256("function.zip")
}
