############################################################################
##################### GET PUZZLE API GATEWAY CONFIGURATION ################
############################################################################

# Get Puzzle API Gateway Resource (/get-puzzle)
resource "aws_api_gateway_resource" "lpk_get_puzzle_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_rest_api.lpk_api_gateway.root_resource_id
  path_part   = "get-puzzle"
}

# Get Puzzle API Gateway Resource (proxy under /get-puzzle)
resource "aws_api_gateway_resource" "lpk_get_puzzle_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  parent_id   = aws_api_gateway_resource.lpk_get_puzzle_resource.id
  path_part   = "{proxy+}"
}

# Get Puzzle API Gateway Method for /get-puzzle
resource "aws_api_gateway_method" "lpk_get_puzzle_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_get_puzzle_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Get Puzzle API Gateway Method for /get-puzzle/{proxy+}
resource "aws_api_gateway_method" "lpk_get_puzzle_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id   = aws_api_gateway_resource.lpk_get_puzzle_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Get Puzzle API Gateway Integration for /get-puzzle
resource "aws_api_gateway_integration" "lpk_get_puzzle_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_get_puzzle_resource.id
  http_method = aws_api_gateway_method.lpk_get_puzzle_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_puzzle_lambda_invoke_arn
}

# Get Puzzle API Gateway Integration for /get-puzzle/{proxy+}
resource "aws_api_gateway_integration" "lpk_get_puzzle_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.lpk_api_gateway.id
  resource_id = aws_api_gateway_resource.lpk_get_puzzle_proxy_resource.id
  http_method = aws_api_gateway_method.lpk_get_puzzle_proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_puzzle_lambda_invoke_arn
}

# Get Puzzle Lambda permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "lpk_get_puzzle_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway-GetPuzzle"
  action        = "lambda:InvokeFunction"
  function_name = var.get_puzzle_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.lpk_api_gateway.execution_arn}/*/*"
} 