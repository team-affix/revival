locals {
    aws_region = "us-west-1"
    project_name = "revival"
    environment = "dev"
}

output "aws_region" {
    value = local.aws_region
}

output "resource_prefix" {
    value = "${local.project_name}-${local.environment}"
}
