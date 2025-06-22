############################################################################
##################### GET PUZZLE LAMBDA CONFIGURATION ######################
############################################################################

# Get Puzzle Lambda Function (no S3 access needed)
resource "aws_lambda_function" "lpk_get_puzzle_lambda" {
  function_name = "${var.resource_prefix}-get-puzzle-lambda"
  handler       = "dist/index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lpk_lambda_exec_role.arn

  # No environment variables needed for puzzle lambda

  filename         = data.archive_file.lpk_placeholder_lambda_payload.output_path
  source_code_hash = data.archive_file.lpk_placeholder_lambda_payload.output_base64sha256

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
} 