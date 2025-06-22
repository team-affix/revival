############################################################################
########################### VARIABLES CONFIGURATION #######################
############################################################################

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "resource_prefix" {
  type        = string
  description = "Resource prefix"
}

variable "s3_bucket_name" {
  type        = string
  description = "S3 bucket name for Lambda environment variable"
}

variable "s3_bucket_arn" {
  type        = string
  description = "S3 bucket ARN for IAM policy"
}

############################################################################
######################## LOCAL VARIABLES ###################################
############################################################################

############################################################################
###################### SHARED LAMBDA CONFIGURATION #########################
############################################################################

resource "aws_iam_role" "lpk_lambda_exec_role" {
  name = "${var.resource_prefix}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
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

data "archive_file" "lpk_placeholder_lambda_payload" {
  type        = "zip"
  source_dir  = "${path.module}/placeholder/"
  output_path = "${path.module}/placeholder.zip"
}

############################################################################
############################# OUTPUTS ######################################
############################################################################

# Package Pull Lambda Outputs
output "package_pull_lambda_function_name" {
  description = "Name of the Package Pull Lambda function"
  value       = aws_lambda_function.lpk_package_pull_lambda.function_name
}

output "package_pull_lambda_function_arn" {
  description = "ARN of the Package Pull Lambda function"
  value       = aws_lambda_function.lpk_package_pull_lambda.arn
}

output "package_pull_lambda_invoke_arn" {
  description = "Invoke ARN of the Package Pull Lambda function"
  value       = aws_lambda_function.lpk_package_pull_lambda.invoke_arn
}

# Package Push Lambda Outputs
output "package_push_lambda_function_name" {
  description = "Name of the Package Push Lambda function"
  value       = aws_lambda_function.lpk_package_push_lambda.function_name
}

output "package_push_lambda_function_arn" {
  description = "ARN of the Package Push Lambda function"
  value       = aws_lambda_function.lpk_package_push_lambda.arn
}

output "package_push_lambda_invoke_arn" {
  description = "Invoke ARN of the Package Push Lambda function"
  value       = aws_lambda_function.lpk_package_push_lambda.invoke_arn
}

# Get Puzzle Lambda Outputs
output "get_puzzle_lambda_function_name" {
  description = "Name of the Get Puzzle Lambda function"
  value       = aws_lambda_function.lpk_get_puzzle_lambda.function_name
}

output "get_puzzle_lambda_function_arn" {
  description = "ARN of the Get Puzzle Lambda function"
  value       = aws_lambda_function.lpk_get_puzzle_lambda.arn
}

output "get_puzzle_lambda_invoke_arn" {
  description = "Invoke ARN of the Get Puzzle Lambda function"
  value       = aws_lambda_function.lpk_get_puzzle_lambda.invoke_arn
}

# Shared Outputs
output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lpk_lambda_exec_role.arn
}

output "lambda_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.lpk_lambda_exec_role.name
} 