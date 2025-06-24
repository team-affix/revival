stack {
  name        = "Lambda Functions - Dev"
  description = "Lambda functions for the dev environment"
  id          = "lambda-dev"

  # This stack depends on S3
  after = ["../s3"]
}

# Generate the main Terraform configuration
generate_hcl "_main.tf" {
  content {
    # Data source to get S3 bucket info from remote state
    data "terraform_remote_state" "s3" {
      backend = "s3"
      config = {
        bucket = "${global.terraform_backend.bucket}"
        key    = "dev/s3/terraform.tfstate"
        region = "${global.aws_region}"
      }
    }

    module "lambda" {
      source = "../../../modules/lambda"

      aws_region           = var.aws_region
      resource_prefix      = var.resource_prefix
      s3_bucket_name       = data.terraform_remote_state.s3.outputs.bucket_name
      s3_bucket_arn        = data.terraform_remote_state.s3.outputs.bucket_arn
    }
  }
}

# Generate outputs to expose module outputs at stack level
generate_hcl "_outputs.tf" {
  content {
    output "package_pull_lambda_function_name" {
      description = "Name of the Package Pull Lambda function"
      value       = module.lambda.package_pull_lambda_function_name
    }

    output "package_pull_lambda_function_arn" {
      description = "ARN of the Package Pull Lambda function"
      value       = module.lambda.package_pull_lambda_function_arn
    }

    output "package_pull_lambda_invoke_arn" {
      description = "Invoke ARN of the Package Pull Lambda function"
      value       = module.lambda.package_pull_lambda_invoke_arn
    }

    output "package_push_lambda_function_name" {
      description = "Name of the Package Push Lambda function"
      value       = module.lambda.package_push_lambda_function_name
    }

    output "package_push_lambda_function_arn" {
      description = "ARN of the Package Push Lambda function"
      value       = module.lambda.package_push_lambda_function_arn
    }

    output "package_push_lambda_invoke_arn" {
      description = "Invoke ARN of the Package Push Lambda function"
      value       = module.lambda.package_push_lambda_invoke_arn
    }

    output "get_puzzle_lambda_function_name" {
      description = "Name of the Get Puzzle Lambda function"
      value       = module.lambda.get_puzzle_lambda_function_name
    }

    output "get_puzzle_lambda_function_arn" {
      description = "ARN of the Get Puzzle Lambda function"
      value       = module.lambda.get_puzzle_lambda_function_arn
    }

    output "get_puzzle_lambda_invoke_arn" {
      description = "Invoke ARN of the Get Puzzle Lambda function"
      value       = module.lambda.get_puzzle_lambda_invoke_arn
    }

    output "lambda_role_arn" {
      description = "ARN of the Lambda execution role"
      value       = module.lambda.lambda_role_arn
    }

    output "lambda_role_name" {
      description = "Name of the Lambda execution role"
      value       = module.lambda.lambda_role_name
    }
  }
}

# Generate terraform.tfvars (Lambda only needs resource_prefix)
generate_file "terraform.tfvars" {
  content = <<-EOT
    resource_prefix = "${global.resource_prefix}"
    environment     = "${global.environment}"
  EOT
} 