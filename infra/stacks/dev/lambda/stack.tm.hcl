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
    # Data source to get S3 bucket info from the s3 stack
    data "terraform_remote_state" "s3" {
      backend = "s3"
      config = {
        bucket = "${global.project_name}-terraformstate"
        key    = "dev/s3/terraform.tfstate"
        region = "${global.aws_region}"
      }
    }

    module "lambda" {
      source = "../../../modules/lambda"
      aws_region         = var.aws_region
      resource_prefix    = var.resource_prefix
      s3_bucket_name     = data.terraform_remote_state.s3.outputs.bucket_name
      s3_bucket_arn      = data.terraform_remote_state.s3.outputs.bucket_arn
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