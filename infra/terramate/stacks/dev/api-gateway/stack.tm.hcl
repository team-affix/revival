stack {
  name        = "API Gateway - Dev"
  description = "API Gateway for the dev environment"
  id          = "api-gateway-dev"
  
  # This stack depends on Lambda functions
  after = ["../lambda"]
}

# Generate the main Terraform configuration
generate_hcl "_main.tf" {
  content {
    # Data source to get Lambda function info from the lambda stack
    data "terraform_remote_state" "lambda" {
      backend = "s3"
      config = {
        bucket = "${global.project_name}-terraform-state"
        key    = "dev/lambda/terraform.tfstate"
        region = "${global.aws_region}"
      }
    }

    module "api_gateway" {
      source = "../../../modules/api-gateway"
      
      aws_region                        = var.aws_region
      environment                       = var.environment
      project_name                      = var.project_name
      resource_prefix                   = var.resource_prefix
      package_pull_lambda_function_name = data.terraform_remote_state.lambda.outputs.package_pull_lambda_function_name
      package_pull_lambda_invoke_arn    = data.terraform_remote_state.lambda.outputs.package_pull_lambda_invoke_arn
      package_push_lambda_function_name = data.terraform_remote_state.lambda.outputs.package_push_lambda_function_name
      package_push_lambda_invoke_arn    = data.terraform_remote_state.lambda.outputs.package_push_lambda_invoke_arn
      get_puzzle_lambda_function_name   = data.terraform_remote_state.lambda.outputs.get_puzzle_lambda_function_name
      get_puzzle_lambda_invoke_arn      = data.terraform_remote_state.lambda.outputs.get_puzzle_lambda_invoke_arn
    }
  }
}

# Generate terraform.tfvars
generate_file "terraform.tfvars" {
  content = <<-EOT
    environment     = "${global.environment}"
    project_name    = "${global.project_name}"
    resource_prefix = "${global.resource_prefix}"
  EOT
} 