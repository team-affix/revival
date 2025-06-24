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
      source = "../../../modules/api-gateway"

      aws_region       = var.aws_region
      environment      = var.environment
      project_name     = var.project_name
      lambda_function_name = data.terraform_remote_state.lambda.outputs.pull_function_name
      lambda_invoke_arn    = data.terraform_remote_state.lambda.outputs.pull_function_invoke_arn
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

    output "api_gateway_arn" {
      description = "ARN of the API Gateway"
      value       = module.api_gateway.api_gateway_arn
    }
  }
}

# Generate terraform.tfvars
generate_file "terraform.tfvars" {
  content = <<-EOT
    project_name = "${global.project_name}"
    environment  = "${global.environment}"
  EOT
} 