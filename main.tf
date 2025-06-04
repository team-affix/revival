
############################################################################
# USERS SHOULD MODIFY THESE VARIABLES FOR THEIR PUBLISHER'S INFRASTRUCTURE #
############################################################################

variable "AWS_REGION" {
  description = "AWS region"
  type        = string
}

variable "S3_BUCKET_NAME" {
  description = "S3 bucket name"
  type        = string
}

variable "LAMBDA_PACKAGE_PULL_NAME" {
  description = "Lambda package pull name"
  type        = string
}

############################################################################
######################## LOCAL VARIABLES ###################################
############################################################################

locals {
  lambda_placeholder_src_dir_path = "./lambda/placeholder/"
  lambda_placeholder_zip_file_path = "./lambda/placeholder.zip"
}

############################################################################
######################## TERRAFORM BASIC CONFIGURATION #####################
############################################################################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

############################################################################
########################### AWS BASIC CONFIGURATION ########################
############################################################################

provider "aws" {
  region = var.AWS_REGION
}

############################################################################
############################### AWS S3 BUCKET ##############################
############################################################################

resource "aws_s3_bucket" "bucket" {
  bucket = var.S3_BUCKET_NAME
}

############################################################################
########################## AWS LAMBDA CONFIGURATION ########################
############################################################################

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

resource "aws_iam_role_policy" "lambda_s3_access" {
  name = "lambda-s3-access"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      Resource = [
        aws_s3_bucket.bucket.arn,
        "${aws_s3_bucket.bucket.arn}/*"
      ]
    }]
  })
}

############################################################################
########################## AWS LAMBDA FUNCTIONS ############################
############################################################################

data "archive_file" "placeholder_lambda_payload" {
  type        = "zip"
  source_dir  = local.lambda_placeholder_src_dir_path
  output_path = local.lambda_placeholder_zip_file_path
}

resource "aws_lambda_function" "package_pull_lambda" {
  function_name = var.LAMBDA_PACKAGE_PULL_NAME
  handler       = "dist/index.handler"
  runtime       = "nodejs18.x"
  role = aws_iam_role.lambda_exec_role.arn
  
  environment {
    variables = {
      BUCKET_NAME  = var.S3_BUCKET_NAME
    }
  }

  # Use a placeholder lambda for FIRST TIME CREATION, and then update the lambda using a separate process
  filename         = local.lambda_placeholder_zip_file_path
  source_code_hash = data.archive_file.placeholder_lambda_payload.output_base64sha256

  # Ignore the changes to the lambda function filename and source code hash
  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }

}
