############################################################################
########################### VARIABLES CONFIGURATION #######################
############################################################################

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Environment (dev, prod, etc.)"
}

# Package Pull Lambda Variables
variable "package_pull_lambda_function_name" {
  type        = string
  description = "Name of the Package Pull Lambda function"
}

variable "package_pull_lambda_function_arn" {
  type        = string
  description = "ARN of the Package Pull Lambda function"
}

variable "package_pull_lambda_invoke_arn" {
  type        = string
  description = "Invoke ARN of the Package Pull Lambda function"
}

# Package Push Lambda Variables
variable "package_push_lambda_function_name" {
  type        = string
  description = "Name of the Package Push Lambda function"
}

variable "package_push_lambda_function_arn" {
  type        = string
  description = "ARN of the Package Push Lambda function"
}

variable "package_push_lambda_invoke_arn" {
  type        = string
  description = "Invoke ARN of the Package Push Lambda function"
}

# Get Puzzle Lambda Variables
variable "get_puzzle_lambda_function_name" {
  type        = string
  description = "Name of the Get Puzzle Lambda function"
}

variable "get_puzzle_lambda_function_arn" {
  type        = string
  description = "ARN of the Get Puzzle Lambda function"
}

variable "get_puzzle_lambda_invoke_arn" {
  type        = string
  description = "Invoke ARN of the Get Puzzle Lambda function"
}

############################################################################
######################## LOCAL VARIABLES ###################################
############################################################################

locals {
  resource_prefix = "${var.project_name}-${var.environment}"
}

############################################################################
######################## SHARED API GATEWAY ################################
############################################################################

# Single API Gateway REST API for all Lambda functions
resource "aws_api_gateway_rest_api" "lpk_api_gateway" {
  name        = "${local.resource_prefix}-api"
  description = "API Gateway for ${var.project_name} ${var.environment} Lambda functions"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Shared API Gateway Deployment
resource "aws_api_gateway_deployment" "lpk_api_gateway_deployment" {
  depends_on = [
    # Package Pull dependencies
    aws_api_gateway_integration.lpk_package_pull_integration,
    aws_api_gateway_integration.lpk_package_pull_proxy_integration,
    # Package Push dependencies
    aws_api_gateway_integration.lpk_package_push_integration,
    aws_api_gateway_integration.lpk_package_push_proxy_integration,
    # Get Puzzle dependencies
    aws_api_gateway_integration.lpk_get_puzzle_integration,
    aws_api_gateway_integration.lpk_get_puzzle_proxy_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id

  triggers = {
    redeployment = sha1(jsonencode([
      # Package Pull triggers
      aws_api_gateway_resource.lpk_package_pull_resource.id,
      aws_api_gateway_resource.lpk_package_pull_proxy_resource.id,
      aws_api_gateway_method.lpk_package_pull_method.id,
      aws_api_gateway_method.lpk_package_pull_proxy_method.id,
      aws_api_gateway_integration.lpk_package_pull_integration.id,
      aws_api_gateway_integration.lpk_package_pull_proxy_integration.id,
      # Package Push triggers
      aws_api_gateway_resource.lpk_package_push_resource.id,
      aws_api_gateway_resource.lpk_package_push_proxy_resource.id,
      aws_api_gateway_method.lpk_package_push_method.id,
      aws_api_gateway_method.lpk_package_push_proxy_method.id,
      aws_api_gateway_integration.lpk_package_push_integration.id,
      aws_api_gateway_integration.lpk_package_push_proxy_integration.id,
      # Get Puzzle triggers
      aws_api_gateway_resource.lpk_get_puzzle_resource.id,
      aws_api_gateway_resource.lpk_get_puzzle_proxy_resource.id,
      aws_api_gateway_method.lpk_get_puzzle_method.id,
      aws_api_gateway_method.lpk_get_puzzle_proxy_method.id,
      aws_api_gateway_integration.lpk_get_puzzle_integration.id,
      aws_api_gateway_integration.lpk_get_puzzle_proxy_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Shared API Gateway Stage
resource "aws_api_gateway_stage" "lpk_api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.lpk_api_gateway_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  stage_name    = var.environment
}

############################################################################
############################# OUTPUTS ######################################
############################################################################

# API Gateway Base URL
output "api_gateway_url" {
  description = "Base URL of the API Gateway"
  value       = aws_api_gateway_stage.lpk_api_gateway_stage.invoke_url
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.lpk_api_gateway.id
}

# Package Pull API endpoints
output "package_pull_api_url" {
  description = "URL for Package Pull API endpoint"
  value       = "${aws_api_gateway_stage.lpk_api_gateway_stage.invoke_url}/package-pull"
}

# Package Push API endpoints
output "package_push_api_url" {
  description = "URL for Package Push API endpoint"
  value       = "${aws_api_gateway_stage.lpk_api_gateway_stage.invoke_url}/package-push"
}

# Get Puzzle API endpoints
output "get_puzzle_api_url" {
  description = "URL for Get Puzzle API endpoint"
  value       = "${aws_api_gateway_stage.lpk_api_gateway_stage.invoke_url}/get-puzzle"
} 