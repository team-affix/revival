############################################################################
#################### PACKAGE PUSH API GATEWAY CONFIGURATION ###############
############################################################################

# Package Push API Gateway Resource (/package-push)
resource "aws_api_gateway_resource" "lpk_package_push_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_rest_api.lpk_api_gateway.root_resource_id
  path_part   = "package-push"
}

# Package Push API Gateway Resource (proxy under /package-push)
resource "aws_api_gateway_resource" "lpk_package_push_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_resource.lpk_package_push_resource.id
  path_part   = "{proxy+}"
}

# Package Push API Gateway Method for /package-push
resource "aws_api_gateway_method" "lpk_package_push_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_package_push_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Package Push API Gateway Method for /package-push/{proxy+}
resource "aws_api_gateway_method" "lpk_package_push_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_package_push_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Package Push API Gateway Integration for /package-push
resource "aws_api_gateway_integration" "lpk_package_push_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_package_push_resource.id
  http_method = aws_api_gateway_method.lpk_package_push_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.package_push_lambda_invoke_arn
}

# Package Push API Gateway Integration for /package-push/{proxy+}
resource "aws_api_gateway_integration" "lpk_package_push_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_package_push_proxy_resource.id
  http_method = aws_api_gateway_method.lpk_package_push_proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.package_push_lambda_invoke_arn
}

# Package Push Lambda permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "lpk_package_push_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway-PackagePush"
  action        = "lambda:InvokeFunction"
  function_name = var.package_push_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lpk_api_gateway.execution_arn}/*/*"
} 