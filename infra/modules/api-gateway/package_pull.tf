############################################################################
#################### PACKAGE PULL API GATEWAY CONFIGURATION ###############
############################################################################

# Package Pull API Gateway Resource (/package-pull)
resource "aws_api_gateway_resource" "lpk_package_pull_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_rest_api.lpk_api_gateway.root_resource_id
  path_part   = "package-pull"
}

# Package Pull API Gateway Resource (proxy under /package-pull)
resource "aws_api_gateway_resource" "lpk_package_pull_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_resource.lpk_package_pull_resource.id
  path_part   = "{proxy+}"
}

# Package Pull API Gateway Method for /package-pull
resource "aws_api_gateway_method" "lpk_package_pull_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_package_pull_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Package Pull API Gateway Method for /package-pull/{proxy+}
resource "aws_api_gateway_method" "lpk_package_pull_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_package_pull_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Package Pull API Gateway Integration for /package-pull
resource "aws_api_gateway_integration" "lpk_package_pull_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_package_pull_resource.id
  http_method = aws_api_gateway_method.lpk_package_pull_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.package_pull_lambda_invoke_arn
}

# Package Pull API Gateway Integration for /package-pull/{proxy+}
resource "aws_api_gateway_integration" "lpk_package_pull_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_package_pull_proxy_resource.id
  http_method = aws_api_gateway_method.lpk_package_pull_proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.package_pull_lambda_invoke_arn
}

# Package Pull Lambda permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "lpk_package_pull_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway-PackagePull"
  action        = "lambda:InvokeFunction"
  function_name = var.package_pull_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lpk_api_gateway.execution_arn}/*/*"
} 