############################################################################
# LAMBDA MODULE CONFIGURATION
############################################################################

data "terraform_remote_state" "s3" {
    backend = "local"
    config = {
        path = "../s3/terraform.tfstate"
    }
}

# Use common module for shared variables and naming
data "terraform_remote_state" "common" {
    backend = "local"
    config = {
        path = "../common/terraform.tfstate"
    }
}

############################################################################
######################## LOCAL VARIABLES ###################################
############################################################################

locals {
    aws_region = data.terraform_remote_state.common.outputs.aws_region
    resource_prefix = data.terraform_remote_state.common.outputs.resource_prefix
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
  region = local.aws_region
}

############################################################################
########################## AWS LAMBDA CONFIGURATION ########################
############################################################################

resource "aws_iam_role" "lpk_lambda_exec_role" {
  name = "${local.resource_prefix}-lambda-exec-role"

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

resource "aws_iam_role_policy_attachment" "lpk_lambda_basic_execution" {
  role       = aws_iam_role.lpk_lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lpk_lambda_package_pull_s3_access" {
  name = "${local.resource_prefix}-lambda-s3-policy"
  role = aws_iam_role.lpk_lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      Resource = [
        data.terraform_remote_state.s3.outputs.bucket_arn,
        "${data.terraform_remote_state.s3.outputs.bucket_arn}/*"
      ]
    }]
  })
}

############################################################################
########################## AWS LAMBDA FUNCTIONS ############################
############################################################################

data "archive_file" "lpk_placeholder_lambda_payload" {
  type        = "zip"
  source_dir  = "./placeholder/"
  output_path = "./placeholder.zip"
}

resource "aws_lambda_function" "lpk_package_pull_lambda" {
  function_name = "${local.resource_prefix}-package-pull-lambda"
  handler       = "dist/index.handler"
  runtime       = "nodejs18.x"
  role = aws_iam_role.lpk_lambda_exec_role.arn
  
  environment {
    variables = {
      BUCKET_NAME  = data.terraform_remote_state.s3.outputs.bucket_name
    }
  }

  # Use a placeholder lambda for FIRST TIME CREATION, and then update the lambda using a separate process
  filename         = data.archive_file.lpk_placeholder_lambda_payload.output_path
  source_code_hash = data.archive_file.lpk_placeholder_lambda_payload.output_base64sha256

  # Ignore the changes to the lambda function filename and source code hash
  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }

}

############################################################################
############################# OUTPUTS ######################################
############################################################################

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.lpk_package_pull_lambda.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.lpk_package_pull_lambda.arn
}

output "lambda_function_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.lpk_package_pull_lambda.invoke_arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lpk_lambda_exec_role.arn
}

output "lambda_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.lpk_lambda_exec_role.name
}
