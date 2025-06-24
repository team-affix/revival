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
    # Data source to get Lambda function info from remote state
    data "terraform_remote_state" "lambda" {
      backend = "s3"
      config = {
        bucket = "${global.terraform_backend.bucket}"
        key    = "dev/lambda/terraform.tfstate"
        region = "${global.aws_region}"
      }
    }

    module "api_gateway" {
      source               = "../../../modules/api-gateway"
      resource_prefix      = var.resource_prefix
      aws_region           = var.aws_region
      environment          = var.environment
      project_name         = var.project_name
      
      # Package Pull Lambda variables
      package_pull_lambda_function_name = data.terraform_remote_state.lambda.outputs.package_pull_lambda_function_name
      package_pull_lambda_function_arn  = data.terraform_remote_state.lambda.outputs.package_pull_lambda_function_arn
      package_pull_lambda_invoke_arn    = data.terraform_remote_state.lambda.outputs.package_pull_lambda_invoke_arn
      
      # Package Push Lambda variables
      package_push_lambda_function_name = data.terraform_remote_state.lambda.outputs.package_push_lambda_function_name
      package_push_lambda_function_arn  = data.terraform_remote_state.lambda.outputs.package_push_lambda_function_arn
      package_push_lambda_invoke_arn    = data.terraform_remote_state.lambda.outputs.package_push_lambda_invoke_arn
      
      # Get Puzzle Lambda variables
      get_puzzle_lambda_function_name = data.terraform_remote_state.lambda.outputs.get_puzzle_lambda_function_name
      get_puzzle_lambda_function_arn  = data.terraform_remote_state.lambda.outputs.get_puzzle_lambda_function_arn
      get_puzzle_lambda_invoke_arn    = data.terraform_remote_state.lambda.outputs.get_puzzle_lambda_invoke_arn
    }
  }
}

# Generate outputs to expose module outputs at stack level
generate_hcl "_outputs.tf" {
  content {
    output "api_gateway_url" {
      description = "URL of the API Gateway"
      value       = module.api_gateway.api_gateway_url
    }

    output "api_gateway_id" {
      description = "ID of the API Gateway"
      value       = module.api_gateway.api_gateway_id
    }

    output "package_pull_api_url" {
      description = "URL for Package Pull API endpoint"
      value       = module.api_gateway.package_pull_api_url
    }

    output "package_push_api_url" {
      description = "URL for Package Push API endpoint"
      value       = module.api_gateway.package_push_api_url
    }

    output "get_puzzle_api_url" {
      description = "URL for Get Puzzle API endpoint"
      value       = module.api_gateway.get_puzzle_api_url
    }
  }
}

# Generate terraform.tfvars
generate_file "terraform.tfvars" {
  content = <<-EOT
    project_name = "${global.project_name}"
    environment  = "${global.environment}"
    resource_prefix = "${global.resource_prefix}"
  EOT
} 