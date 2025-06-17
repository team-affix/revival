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

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda function"
}

variable "lambda_function_arn" {
  type        = string
  description = "ARN of the Lambda function"
}

variable "lambda_invoke_arn" {
  type        = string
  description = "Invoke ARN of the Lambda function"
}

############################################################################
######################## LOCAL VARIABLES ###################################
############################################################################

locals {
  resource_prefix = "${var.project_name}-${var.environment}"
}

############################################################################
########################## API GATEWAY CONFIGURATION #######################
############################################################################

# API Gateway REST API
resource "aws_api_gateway_rest_api" "lpk_api_gateway" {
  name        = "${local.resource_prefix}-api"
  description = "API Gateway for ${var.project_name} ${var.environment} Lambda functions"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway Resource (catch-all proxy)
resource "aws_api_gateway_resource" "lpk_api_gateway_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_rest_api.lpk_api_gateway.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway Method for proxy resource
resource "aws_api_gateway_method" "lpk_api_gateway_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_api_gateway_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Method for root resource
resource "aws_api_gateway_method" "lpk_api_gateway_root_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_rest_api.lpk_api_gateway.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Integration for proxy resource
resource "aws_api_gateway_integration" "lpk_api_gateway_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_api_gateway_proxy_resource.id
  http_method = aws_api_gateway_method.lpk_api_gateway_proxy_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.lambda_invoke_arn
}

# API Gateway Integration for root resource
resource "aws_api_gateway_integration" "lpk_api_gateway_root_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_rest_api.lpk_api_gateway.root_resource_id
  http_method = aws_api_gateway_method.lpk_api_gateway_root_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.lambda_invoke_arn
}

# Lambda permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "lpk_api_gateway_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lpk_api_gateway.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "lpk_api_gateway_deployment" {
  depends_on = [
    aws_api_gateway_integration.lpk_api_gateway_proxy_integration,
    aws_api_gateway_integration.lpk_api_gateway_root_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id

  # Force redeployment on configuration changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.lpk_api_gateway_proxy_resource.id,
      aws_api_gateway_method.lpk_api_gateway_proxy_method.id,
      aws_api_gateway_method.lpk_api_gateway_root_method.id,
      aws_api_gateway_integration.lpk_api_gateway_proxy_integration.id,
      aws_api_gateway_integration.lpk_api_gateway_root_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "lpk_api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.lpk_api_gateway_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  stage_name    = var.environment
}

############################################################################
############################# OUTPUTS ######################################
############################################################################

output "api_gateway_url" {
  description = "Base URL of the API Gateway"
  value       = aws_api_gateway_stage.lpk_api_gateway_stage.invoke_url
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.lpk_api_gateway.id
}

output "api_gateway_arn" {
  description = "ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.lpk_api_gateway.arn
}

output "api_gateway_execution_arn" {
  description = "Execution ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.lpk_api_gateway.execution_arn
} 