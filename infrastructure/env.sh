# AWS Managed Infrastructure
export TF_VAR_aws_region="us-west-1"
export TF_VAR_project_name="revival"

# Terraform State
export TF_VAR_state_bucket="revival-terraformstate"
export TF_VAR_state_region="us-west-1"
export TF_VAR_state_encrypt="true"

# Terraform State Keys
export TF_VAR_state_s3_key="s3/terraform.tfstate"
export TF_VAR_state_lambda_key="lambda/terraform.tfstate"
